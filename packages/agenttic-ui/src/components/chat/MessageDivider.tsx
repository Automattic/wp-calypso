import styles from './MessageDivider.module.css';

interface MessageDividerProps {
	message?: string;
}

export function MessageDivider( { message = '' }: MessageDividerProps ) {
	return (
		<div className={ styles.container }>
			<div className={ styles.line } />
			{ message && (
				<>
					<span className={ styles.message }>{ message }</span>
					<div className={ styles.line } />
				</>
			) }
		</div>
	);
}
