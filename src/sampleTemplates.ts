import type { Template } from './types'

// Obviously fake seed data for local development — no real agents or teams.
export const SAMPLE_TEMPLATES: Template[] = [
  {
    id: 'sample-team-release',
    title: 'Sample Team Release',
    category: 'Team Release',
    body: `Hi {{Agent Full Name}},

This confirms that the release of agent {{Agent Full Name}} from {{Team Name}} has been processed in {{State Initials}}, effective the date of this notice.

No action is needed on your side. Reply to this email if you see any discrepancy.

— Sample Records Desk (not a real team)`,
  },
  {
    id: 'sample-comp-split-release',
    title: 'Sample Compensation Split Release',
    category: 'Compensation Split Release',
    body: `Hi {{Agent Full Name}},

Your compensation split of {{Split Percentage}} has been released for the period ending {{Period End Date}}.

This is sample data for testing the generator — amounts shown in the real tool would come from payroll.

— Sample Payroll Bot (not a real sender)`,
  },
  {
    id: 'sample-general-checkin',
    title: 'Sample General Check-In',
    category: 'General',
    body: `Hi {{Agent Full Name}},

Just checking in regarding {{Topic}}. When you have a moment, let me know how things are going.

Thanks,
{{Sender Name}}
(Sample template — replace before real use)`,
  },
]
