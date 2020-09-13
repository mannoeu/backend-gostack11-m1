const express = require("express");
const { uuid, isUuid } = require("uuidv4");
const app = express();
app.use(express.json());

const projects = [];

function logRequests(req, res, next) {
  const { method, url } = req;

  const LogLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(LogLabel);

  next();

  console.timeEnd(LogLabel);
}

function validateProjectId(req, res, next) {
  const { id } = req.params;

  if (!isUuid(id)) {
    return res.status(400).json({
      error: "Invalid project ID",
    });
  }

  return next();
}

app.use(logRequests);
app.use("/projects/:id", validateProjectId);

app.get("/projects", (req, res) => {
  const { title } = req.query;

  const filtered = title
    ? projects.filter((project) =>
        project.title.toLowerCase().includes(title.toLowerCase())
      )
    : projects;

  return res.json(filtered);
});

app.post("/projects", (req, res) => {
  const { title, owner } = req.body;
  const project = { id: uuid(), title, owner };

  projects.push(project);

  return res.json(project);
});

app.put("/projects/:id", (req, res) => {
  const { id } = req.params;
  const projectIndex = projects.findIndex((project) => project.id === id);

  if (projectIndex < 0) {
    return res.status(404).send({
      error: "Project not found",
    });
  }

  const { title, owner } = req.body;
  const project = { id, title, owner };

  projects[projectIndex] = project;

  return res.json(project);
});

app.delete("/projects/:id", (req, res) => {
  const { id } = req.params;

  const projectIndex = projects.findIndex((project) => project.id === id);

  if (projectIndex < 0) {
    return res.status(404).send({
      error: "Project not found",
    });
  }

  projects.splice(projectIndex, 1);

  return res.status(200).send();
});

app.listen(3333, () => console.log("Server started"));
