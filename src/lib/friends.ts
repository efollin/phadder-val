import { prismaClient } from "$lib";
import {
  Position,
  Mission,
  InterviewerRole,
  PrismaClient,
} from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedFriend = async (
  prisma: Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0],
  line: string,
) => {
  const values = line.split("\t");
  //console.log(line, values);
  let [ownerName, friend1Name, friend2Name] = [
    values[2],
    values[11],
    values[12],
  ];
  const owner = await prismaClient.applicant.findFirst({
    where: {
      name: {
        contains: ownerName.trim(),
      },
    },
  });
  if (friend1Name.startsWith("!")) friend1Name = "";
  if (friend2Name.startsWith("!")) friend2Name = "";
  if (!owner) {
    throw new Error(`Could not find owner ${ownerName}`);
  }
  console.log(friend1Name);
  //console.log(friend2Name);
  const friend1 =
    friend1Name && friend1Name.length > 0
      ? await prismaClient.applicant.findFirst({
          where: {
            name: {
              contains: friend1Name.trim(),
            },
          },
        })
      : null;
  if (friend1Name && friend1Name.length > 0 && !friend1) {
    throw new Error(`Could not find friend1 ${friend1Name}`);
  }
  const friend2 =
    friend2Name && friend2Name.length > 0
      ? await prismaClient.applicant.findFirst({
          where: {
            name: {
              contains: friend2Name.trim(),
            },
          },
        })
      : null;
  if (friend2Name && friend2Name.length > 0 && !friend2) {
    throw new Error(`Could not find friend2 ${friend2Name}`);
  }
  //console.log(friend1);
  //console.log(friend2);
  if (friend1) {
    await prisma.applicant.update({
      where: {
        id: owner.id,
      },
      data: {
        friend1: {
          connect: {
            id: friend1.id,
          },
        },
      },
    });
  }
  if (friend2) {
    await prisma.applicant.update({
      where: {
        id: owner.id,
      },
      data: {
        friend2: {
          connect: {
            id: friend2.id,
          },
        },
      },
    });
  }
};

export const seedFriends = async () => {
  const file = fs.readFileSync(path.resolve(__dirname, "./data/responses.tsv"));

  const tsv = file.toString();
  const lines = tsv.split("\n");
  try {
    await prismaClient.$transaction(async (p) => {
      for (const line of lines) {
        await seedFriend(p, line);
      }
    });
  } catch (e) {
    throw e;
  }
};
