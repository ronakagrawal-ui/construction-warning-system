import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authorized: you must be signed in");
  }
  return session;
}

export async function requireNonGuest() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authorized: you must be signed in");
  }
  if (session.user.role === "guest") {
    throw new Error("Guests have read-only access");
  }
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Not authorized: admin access required");
  }
  return session;
}