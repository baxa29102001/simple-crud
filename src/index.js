import { createServer } from "http";
import { v4 as uuidv4, validate } from "uuid";

import { config } from "dotenv";

config();

const PORT = process.env.PORT || 3000;

let USERS = [];

const server = createServer();

server.on("request", (req, res) => {
  if (req.url === "/api/users" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(USERS));
  } else if (req.method === "GET" && req.url.startsWith("/api/users/")) {
    const urlParts = req.url.split("/");
    const id = urlParts[3];

    if (!validate(id)) {
      res.writeHead(400);
      res.end("UserId is invalid (not uuid)");
      return;
    }
    const findedUser = USERS.find((item) => item.id === id);

    if (!findedUser) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end("User doesn't exist");
    } else {
      res.end(JSON.stringify(findedUser));
    }
  } else if (req.method === "DELETE" && req.url.startsWith("/api/users/")) {
    const urlParts = req.url.split("/");
    const id = urlParts[3];

    if (!validate(id)) {
      res.writeHead(400);
      res.end("UserId is invalid (not uuid)");
      return;
    }
    const findedUser = USERS.find((item) => item.id === id);

    if (!findedUser) {
      res.writeHead(404);
      res.end("User doesn't exist");
    } else {
      USERS = USERS.filter((item) => item.id !== id);
      res.writeHead(204);
      res.end("Record is found and deleted");
    }
  } else if (req.method === "PUT" && req.url.startsWith("/api/users/")) {
    req.on("data", (chunk) => {
      const data = Buffer.concat([chunk]).toString();
      const { age, hobbies, username } = JSON.parse(data);

      if (!age || !username || hobbies.length === 0) {
        res.writeHead(400);
        res.end("username,age,hobbies required");
      }
      const urlParts = req.url.split("/");
      const id = urlParts[3];

      if (!validate(id)) {
        res.writeHead(400);
        res.end("UserId is invalid (not uuid)");
        return;
      }
      const findedUserIndex = USERS.findIndex((item) => item.id === id);

      if (findedUserIndex === -1) {
        res.writeHead(404);
        res.end("User doesn't exist");
      } else {
        const dataObj = {
          ...USERS[findedUserIndex],
          id: USERS[findedUserIndex].id,
          username,
          age,
          hobbies,
        };
        USERS.splice(findedUserIndex, 0, dataObj);
        res.writeHead(200);
        res.end(JSON.stringify(dataObj));
      }
    });
  } else if (req.url === "/api/users" && req.method === "POST") {
    req.on("data", (chunk) => {
      const data = Buffer.concat([chunk]).toString();
      const { age, hobbies, username } = JSON.parse(data);
      if (!age || !username || hobbies.length === 0) {
        res.writeHead(400);
        res.end("username,age,hobbies required");
      } else {
        const obj = {
          id: uuidv4(),
          username,
          age,
          hobbies,
        };

        USERS.push(obj);
        res.writeHead(201);
        res.end(JSON.stringify(obj));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found anything");
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
