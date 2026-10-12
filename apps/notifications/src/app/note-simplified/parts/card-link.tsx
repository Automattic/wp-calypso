import type { ReactNode } from 'react';

export default function CardLink( { url, children }: { url?: string; children: ReactNode } ) {
	return url ? (
		<a className="wpnc-simplified__card" href={ url } target="_blank" rel="noreferrer">
			{ children }
		</a>
	) : (
		<div className="wpnc-simplified__card">{ children }</div>
	);
}
