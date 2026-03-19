import ConnectPage from "./_component/ConnectPage";


export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; platform?: string }>;
}) {
  const params = await searchParams;

  return (
    <ConnectPage
      state={params.state}
      platform={params.platform}
    />
  );
}