# Magic Progress project rules

- One completed homework task equals one crystal.
- Homework has no exercise categories.
- Reward purchases reduce `balance`, never `totalEarned`.
- Map progress depends only on `totalEarned`.
- Students do not authenticate and Student Tracker is read-only.
- `students` is private; public access is limited to get-only `publicProfiles`.
- Every balance change must use a Firestore transaction.
- Do not add pets, leaderboards, or competitive mechanics.
- Keep the student interface simple and the admin interface fast and practical.

