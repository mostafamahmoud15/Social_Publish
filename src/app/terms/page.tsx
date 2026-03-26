import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-4xl text-gray-800">
        <h1 className="mb-3 text-3xl font-bold tracking-tight">
          Terms of Service for Benaa Social Publisher
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Effective date: {new Date().toLocaleDateString()}
        </p>

        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p>
            These Terms of Service govern access to and use of Benaa Social
            Publisher, a web-based social media dashboard that allows users to
            connect their TikTok account and publish video content using TikTok
            APIs.
          </p>

          <p>
            By accessing or using Benaa Social Publisher, you agree to be bound
            by these Terms of Service. If you do not agree, you should not use
            the platform.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">Use of the Service</h2>
          <div className="space-y-4">
            <p>
              Benaa Social Publisher provides tools that help users connect
              social media accounts and manually publish content through
              authorized platform integrations.
            </p>
            <p>
              Users may use the platform only for lawful purposes and in
              compliance with all applicable laws, regulations, and third-party
              platform policies, including TikTok policies and guidelines.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">TikTok Integration</h2>
          <div className="space-y-4">
            <p>
              Benaa Social Publisher allows users to connect their TikTok
              account through OAuth authorization and use TikTok APIs to upload
              and publish video content.
            </p>
            <p>
              All publishing actions are initiated manually by the user. Benaa
              Social Publisher does not automatically publish content without
              direct user action.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">User Responsibilities</h2>
          <div className="space-y-4">
            <p>Users are solely responsible for:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>The accuracy of information they provide</li>
              <li>The content they upload and publish</li>
              <li>
                Ensuring that their use of the platform complies with applicable
                laws and platform policies
              </li>
            </ul>
            <p>
              Users must not use Benaa Social Publisher to publish unlawful,
              harmful, misleading, infringing, or abusive content.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">Account Access</h2>
          <div className="space-y-4">
            <p>
              Users are responsible for maintaining the security of their own
              accounts and credentials used to access Benaa Social Publisher and
              connected services.
            </p>
            <p>
              Users may disconnect their TikTok account from the platform at any
              time, where supported.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">
            Intellectual Property and Content
          </h2>
          <div className="space-y-4">
            <p>
              Users retain responsibility for and rights to the content they
              upload, subject to the terms of the platforms where the content is
              published.
            </p>
            <p>
              Benaa Social Publisher does not claim ownership of user-generated
              content, but users grant the platform the limited rights necessary
              to process, upload, and publish such content in order to provide
              the service.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">Service Availability</h2>
          <p>
            Benaa Social Publisher may update, modify, suspend, or discontinue
            parts of the service at any time, including features dependent on
            third-party APIs or platform availability.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">Termination</h2>
          <p>
            We reserve the right to suspend, restrict, or terminate access to
            Benaa Social Publisher if a user violates these Terms of Service,
            applicable laws, or third-party platform policies.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Benaa Social Publisher shall
            not be liable for any indirect, incidental, special, consequential,
            or similar damages arising from the use of the service, connected
            platform integrations, or user-generated content.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">Changes to These Terms</h2>
          <p>
            Benaa Social Publisher may revise these Terms of Service from time
            to time. Continued use of the platform after updated terms are
            posted may constitute acceptance of the revised terms.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, you may
            contact Benaa Social Publisher at{" "}
            <Link
              href="mailto:benaa.social0@gmail.com"
              className="font-medium text-blue-600 underline underline-offset-4"
            >
              benaa.social0@gmail.com
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}