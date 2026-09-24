import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import styles from './MessageCard.module.css';

interface MessageCardProps {
	title: string;
	description?: string;
	url?: string;
}

export function MessageCard( { title, description, url }: MessageCardProps ) {
	const content = (
		<>
			<div className={ styles.content }>
				<div className={ styles.title }>{ title }</div>
				{ description && <p className={ styles.description }>{ description }</p> }
			</div>
			{ url && <ChevronRightIcon className={ styles.chevron } /> }
		</>
	);

	if ( url ) {
		return (
			<a href={ url } className={ styles.card } target="_blank" rel="noopener noreferrer">
				{ content }
			</a>
		);
	}

	return <div className={ styles.card }>{ content }</div>;
}
