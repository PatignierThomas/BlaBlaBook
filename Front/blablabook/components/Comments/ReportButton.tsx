"use client";

import { useState } from "react";

export default function ReportButton({
	commentId,
	token,
}: {
	commentId: number;
	token: string;
}) {
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);

	const onReport = async () => {
		if (loading || done) return;
		setLoading(true);

		try {
			const url = `/api/comments/${commentId}/report`;
			const res = await fetch(url, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (res.ok) {
				setDone(true);
				return;
			}

			if (res.status === 409) {
				setDone(true);
				return;
			}

			const text = await res.text().catch(() => "");
			console.error("report failed", res.status, text);
		} finally {
			setLoading(false);
		}
	};

	return (
		<button
			type="button"
			onClick={onReport}
			disabled={loading || done}
			title={done ? "Commentaire déjà signalé" : "Signaler ce commentaire"}
			className={`
    group inline-flex items-center gap-1.5
    rounded-md px-2 py-1 text-xs font-medium
    transition cursor-pointer
    ${
			done
				? "text-red-400 cursor-default"
				: "text-gray-400 hover:text-red-500 hover:bg-red-50"
		}
    disabled:opacity-50
  `}
		>
			<span className="material-icons text-sm">
				{done ? "flag" : "outlined_flag"}
			</span>

			<span className="hidden sm:inline">{done ? "Signalé" : "Signaler"}</span>
		</button>
	);
}
