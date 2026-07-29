import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google,
    Credentials({
      id: "guest",
      name: "Guest",
      credentials: {},
      async authorize() {
        return {
          id: "guest-user",
          name: "Guest",
          email: "guest@demo.local",
          role: "guest",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
  if (account?.provider === "guest") return true;
  const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email !== "");
  return allowedEmails.includes(user.email ?? "");
},
  
    async jwt({ token, user }) {
   
      if (user) {
        if ((user as { role?: string }).role === "guest") {
          token.role = "guest";
        } else {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email ?? "" },
        });
        token.role = dbUser?.role ?? "user";
      }
    }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});