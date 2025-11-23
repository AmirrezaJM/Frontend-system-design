# Level 0 – Plain Client–Server Cinema App

![Level 0 diagram](docs/level0.png)

This repository showcases **Level 0 – Plain client–server** frontend system design. A single Node/Express server serves the HTML/CSS/JS, exposes JSON APIs, and talks to the (fake) database. Every user request terminates at this one box, which makes it the simplest possible deployment model.

## Level 0 in practice

**What the server does**

- Serves the UI bundle (`public/`) with `HTML`, `CSS`, and `JS`.
- Handles API requests such as `/api/movies`.
- Talks to the data source (here, an in-memory array instead of a real database).

**Pros**

- Simple to build and deploy.
- Great for MVPs, internal tools, and early-stage products.
- Easy to debug because everything lives in one place.

**Cons**

- Single point of failure.
- Limited scalability—when traffic grows, everything slows down.
- High latency for users far from your server location.

If your users are in one region and traffic is still low, Level 0 is fine. The problem appears when your app gets slower as soon as traffic or geography grows.

## Project overview

- `server.js` – Express server that both serves static files and exposes `/api/movies` plus a fake booking endpoint. It doubles as the “backend” and “frontend host,” highlighting the tight coupling of Level 0 systems.
- `public/` – Plain HTML, CSS, and a small `app.js` file that fetches data from the same origin.
- No separate database layer—`movies` are stored in memory to emphasize how minimal the setup can be.

This combination illustrates how most products begin: fast to set up, but constrained once traffic or geography grows.

## Running the cinema app locally

```bash
cd level0/cinema-app
npm install
npm start
```

Then open `http://localhost:3000` to load the UI and exercise the API from the same origin.

## When to move beyond Level 0

Stay at Level 0 for:

- MVPs where feature velocity matters more than performance.
- Internal tools with a captive audience in one region.
- Early-stage products where the goal is to validate the idea quickly.

Start planning the next architecture level (CDN, multi-tier, caching, etc.) once you notice latency complaints, CPU/memory limits, or the team needs to deploy frontend and backend independently.
