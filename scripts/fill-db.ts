// import { prisma } from "../src/server/db/client";
import { PrismaClient } from "@prisma/client";

type HttpResponse = {
  name: string;
  category: string;
  group: string;
  htmlCode: string[];
  unicode: string;
};

type Emoji = {
  name: string;
  htmlCode: string;
};

async function fill() {
  let emojis = await fetch("https://emojihub.yurace.pro/api/all")
    .then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    })
    .then((data) =>
      (data as Array<HttpResponse>).map(
        ({ name, htmlCode }) => ({ name: name, htmlCode: htmlCode[0] } as Emoji)
      )
    );

  const prisma = new PrismaClient();

  for (const { name, htmlCode } of emojis) {
    await prisma.emoji.create({
      data: {
        name: name,
        htmlCode: htmlCode,
        wins: 0,
        total: 0,
      },
    });
  }
}

fill();

async function deleteEmojis() {
  const prisma = new PrismaClient();

  const users = await prisma.emoji.findMany({});

  const deleteUser = async (emoji: any) => {
    return await prisma.emoji.delete({
      where: { id: emoji.id },
    });
  };

  const deleteUsers = async () => {
    users.map((user) => deleteUser(user));
  };

  deleteUsers();
}

// deleteEmojis();
