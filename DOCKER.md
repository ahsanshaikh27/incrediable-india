# 🐳 Docker Production Setup — Incredible India

Complete production-grade containerization guide for the Incredible India full-stack application.

---

## 📁 Docker Files Overview

```
frontend/
├── Dockerfile.backend      # Multi-stage Node.js Dockerfile
├── Dockerfile.frontend     # Multi-stage Nginx Dockerfile
├── docker-compose.yml      # Full production stack
├── nginx.conf              # Nginx reverse proxy config
├── .dockerignore           # Files excluded from image
└── .env                    # Secret env vars (never commit!)
```

---

## 🏗️ Architecture Diagram

```
                    ┌─────────────────────┐
     Port 80 ───►  │   FRONTEND (Nginx)  │
     (Public)       │   Static Files      │
                    │   + Reverse Proxy   │
                    └────────┬────────────┘
                             │ /api/* proxy
                    ┌────────▼────────────┐
                    │   BACKEND (Node.js) │ ◄── frontend-net
                    │   Express APIs      │
                    │   Port 3000         │
                    └────┬───────────┬────┘
                         │           │
              backend-net│           │backend-net
              (internal) │           │(internal)
                    ┌────▼───┐  ┌───▼────┐
                    │MONGODB │  │ REDIS  │
                    │ :27017 │  │ :6379  │
                    │ Volume │  │ Volume │
                    └────────┘  └────────┘
```

---

## 1️⃣ Multi-Stage Dockerfiles — Explanation

### Backend (`Dockerfile.backend`)

```
Stage 1 (builder)   →  npm ci --only=production
                         Installs only production deps
                         Uses layer caching efficiently

Stage 2 (production) →  node:20-alpine (tiny ~180MB)
                         Copies only node_modules + src
                         Runs as non-root user (UID 1001)
                         Uses dumb-init for signal handling
```

**Why Multi-Stage?**
- Single stage images are **400–800MB**
- Multi-stage brings it down to **~120MB**
- Build tools don't ship in production

### Frontend (`Dockerfile.frontend`)

```
Stage 1 (builder)    →  Validates & copies static files
Stage 2 (production) →  nginx:1.25-alpine (~25MB!)
                         Serves static HTML/CSS/JS
                         Proxies /api/* to backend
```

---

## 2️⃣ Security Best Practices

| Practice | Implementation |
|---|---|
| Non-root user | `adduser nodeuser` + `USER nodeuser` |
| No secrets in image | All secrets via `.env` → env vars |
| Small attack surface | `node:20-alpine` base (no bash, no pkg manager) |
| Payload limit | `express.json({ limit: '10kb' })` |
| Security headers | `X-Frame-Options`, `X-XSS-Protection`, etc. |
| No exposed DB ports | MongoDB/Redis only on `internal` network |
| Read-only FS | Writable only `/app/logs` volume |
| Nginx hardening | `server_tokens off` hides version |

---

## 3️⃣ Docker Compose Services

| Service | Image | Port | Network |
|---|---|---|---|
| `frontend` | Custom (nginx) | 80 (public) | frontend-net |
| `backend` | Custom (node) | 3000 (internal) | frontend-net + backend-net |
| `mongodb` | mongo:7.0 | 27017 (internal) | backend-net |
| `redis` | redis:7.2-alpine | 6379 (internal) | backend-net |

---

## 4️⃣ Auto-Recovery — `restart: always`

All 4 services have `restart: always` which means:

```
Container crashes    →  Docker auto-restarts it  ✅
Server reboots       →  Containers come back up  ✅
Manual stop          →  Restarts again           ✅
```

### Why Docker ≠ Kubernetes for Auto-Healing?

| Feature | Docker `restart: always` | Kubernetes |
|---|---|---|
| Restart crashed container | ✅ Yes | ✅ Yes |
| Restart on node failure | ❌ No | ✅ Yes (reschedules to healthy node) |
| Self-healing pods | ❌ No | ✅ Yes (ReplicaSets) |
| Rolling updates | ❌ Manual | ✅ Automatic |
| Load balancing | ❌ Basic | ✅ Advanced |
| Health-based routing | ❌ No | ✅ Yes |

> **Conclusion:** `restart: always` provides **basic resilience** for single-server setups. For full production at scale, Kubernetes is needed for true auto-healing.

---

## 5️⃣ State Management — Volumes Explained

### Stateless vs Stateful Containers

```
STATELESS (Frontend, Backend)
  ├── No persistent data stored inside
  ├── Can be killed and recreated freely
  └── Scale up/down with zero data risk

STATEFUL (MongoDB, Redis)
  ├── Data lives on disk
  ├── Must use named volumes
  └── NEVER use ephemeral container storage
```

### Why DB Must Use Volumes?

```
Without Volume:
  container stop → ALL DATA GONE ❌

With Named Volume:
  container stop → Data safe on host ✅
  container restart → Data restored ✅
  container recreate → Data restored ✅
```

### Volume Config in Compose

```yaml
volumes:
  mongo-data:   # MongoDB /data/db → HOST disk
  redis-data:   # Redis /data → HOST disk (RDB + AOF)
```

### Redis Persistence (RDB + AOF)

```
RDB (Snapshot):
  --save 60 1     → Save every 60s if 1 key changed
  --save 300 10   → Save every 5min if 10 keys changed

AOF (Append Only File):
  --appendonly yes
  --appendfsync everysec  → Flush to disk every second
```

---

## 6️⃣ Performance Optimization

| Optimization | How |
|---|---|
| NODE_ENV=production | Disables dev middleware, enables Express optimizations |
| Gzip Compression | Nginx compresses JS, CSS, JSON responses |
| Static file caching | `Cache-Control: immutable, 30d` for assets |
| npm ci | Faster, reproducible installs vs npm install |
| Alpine base images | 5x smaller than debian-based |
| Layer caching | `COPY package*.json` before `COPY src/` |
| Resource limits | CPU + Memory limits prevent runaway containers |

---

## 7️⃣ Networking

```yaml
networks:
  frontend-net:   # nginx ↔ backend (bridge, public-accessible)
  backend-net:    # backend ↔ mongo ↔ redis (internal ONLY)
    internal: true
```

- Backend connects to MongoDB as: `mongodb://mongodb:27017` (service name)
- Backend connects to Redis as: `redis://redis:6379` (service name)
- **No hardcoded IPs — Docker DNS resolves service names**

---

## 8️⃣ Logs & Debugging

```bash
# View logs for each service
docker logs incredibleindia-backend -f
docker logs incredibleindia-frontend -f
docker logs incredibleindia-mongodb -f
docker logs incredibleindia-redis -f

# All logs with timestamps
docker-compose logs -f --timestamps

# Health check status
docker inspect --format='{{.State.Health.Status}}' incredibleindia-backend
```

Structured JSON logging via Docker's `json-file` driver:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"   # Rotate after 10MB
    max-file: "5"     # Keep last 5 files
```

---

## 🚀 Run Commands

### Build & Start Everything

```bash
# Build images and start all services
docker-compose up --build -d

# View status
docker-compose ps

# View logs
docker-compose logs -f
```

### Individual Service Commands

```bash
# Restart only backend
docker-compose restart backend

# Scale backend (multiple instances)
docker-compose up --scale backend=3 -d

# Stop everything
docker-compose down

# Stop + remove volumes (DESTROYS DATA!)
docker-compose down -v
```

### Useful Debug Commands

```bash
# Shell into backend container
docker exec -it incredibleindia-backend sh

# Check MongoDB connection
docker exec -it incredibleindia-mongodb mongosh

# Check Redis
docker exec -it incredibleindia-redis redis-cli -a $REDIS_PASSWORD ping

# Check health endpoint
curl http://localhost/api/health
```

---

## 🔐 Security Checklist

- [x] Non-root users in all containers
- [x] No secrets baked into images
- [x] `.env` file for all secrets
- [x] `.dockerignore` excludes `.env`
- [x] MongoDB & Redis not exposed to host
- [x] Nginx hides server version
- [x] Security HTTP headers set
- [x] Payload size limited (10kb)
- [x] Internal network for DBs
- [x] Resource limits on all containers
- [x] Log rotation configured

---

## ⚠️ Important Notes

1. **Never commit `.env`** — Add it to `.gitignore`
2. **MongoDB Atlas** is being used (not local mongo in compose)
3. Change all default passwords before deploying to production
4. Run `docker-compose pull` periodically to get security patches

---

*Production Docker Setup — Incredible India Platform — 2024*
