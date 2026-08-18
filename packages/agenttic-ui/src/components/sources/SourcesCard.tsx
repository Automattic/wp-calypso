import { __ } from '@wordpress/i18n';
import type { AgentSource } from '../../types';
import { cn } from '../../utils/classNames';
import styles from './SourcesCard.module.css';

export interface SourcesCardProps {
	sources: AgentSource[];
	className?: string;
}

export function SourcesCard( { sources, className }: SourcesCardProps ) {
	if ( ! sources?.length ) {
		return null;
	}

	return (
		<section
			className={ cn( styles.card, className ) }
			data-agenttic-sources-card
			data-slot="sources"
		>
			<p className={ styles.heading } data-slot="heading">
				{ __( 'Sources', 'a8c-agenttic' ) }
			</p>
			<ul className={ styles.list } data-slot="list">
				{ sources.map( ( source, index ) => {
					const title =
						source.title ||
						source.url ||
						source.label ||
						__( 'Untitled source', 'a8c-agenttic' );
					const key =
						source.id || source.url || `${ title }-${ index }`;

					return (
						<li
							key={ key }
							className={ styles.item }
							data-slot="source"
						>
							{ source.url ? (
								<a
									className={ styles.title }
									data-slot="title"
									href={ source.url }
									target="_blank"
									rel="noopener noreferrer"
								>
									{ title }
								</a>
							) : (
								<span
									className={ styles.title }
									data-slot="title"
								>
									{ title }
								</span>
							) }
							{ source.label ? (
								<span
									className={ styles.label }
									data-slot="label"
								>
									{ source.label }
								</span>
							) : null }
						</li>
					);
				} ) }
			</ul>
		</section>
	);
}
