interface Props {
	remainingMs: number;
	totalMs: number;
}

export default function TimerBar( { remainingMs, totalMs }: Props ) {
	const ratio = totalMs > 0 ? Math.max( 0, Math.min( 1, remainingMs / totalMs ) ) : 0;
	return (
		<div className="qr-code-app-login__timer" aria-hidden="true">
			<div
				className="qr-code-app-login__timer-fill"
				style={ { transform: `scaleX(${ ratio })` } }
			/>
		</div>
	);
}
