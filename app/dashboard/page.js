"use client";
import KitManager from "@/components/KitManager";
import withAuth from "../utils/withAuth";

const ProtectedKitManager = withAuth(KitManager);

export default function Home() {
    return <ProtectedKitManager />;
}
