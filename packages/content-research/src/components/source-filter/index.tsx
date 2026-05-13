import {
	Button,
	ButtonGroup,
	Tooltip,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalToolsPanel as ToolsPanel,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { Source } from '../../types';

interface SourceFilterProps {
	selectedSources: Set< Source >;
	onToggleSource: ( source: Source ) => void;
	onResetSources: () => void;
}

const SOURCES: { value: Source; label: string; description: string }[] = [
	{
		value: 'myposts',
		label: __( 'Posts', 'content-research' ),
		description: __( 'Search across your own published posts.', 'content-research' ),
	},
	{
		value: 'reader',
		label: __( 'WPCOM', 'content-research' ),
		description: __( 'Posts from the WordPress.com Reader.', 'content-research' ),
	},
	{
		value: 'hn',
		label: __( 'HN', 'content-research' ),
		description: __( 'Top stories from Hacker News.', 'content-research' ),
	},
	{
		value: 'googlenews',
		label: __( 'News', 'content-research' ),
		description: __( 'Recent articles from Google News.', 'content-research' ),
	},
];

export default function SourceFilterTabs( {
	selectedSources,
	onToggleSource,
	onResetSources,
}: SourceFilterProps ) {
	return (
		<ToolsPanel
			className="content-research-source-filter"
			label={ __( 'Research Sources', 'content-research' ) }
			resetAll={ onResetSources }
		>
			<ButtonGroup aria-label={ __( 'Sources', 'content-research' ) }>
				{ SOURCES.map( ( source ) => {
					const isSelected = selectedSources.has( source.value );
					return (
						<Tooltip key={ source.value } text={ source.description }>
							<Button
								className={ `content-research-source-filter__button ${
									isSelected ? 'is-selected' : 'is-deselected'
								}` }
								aria-pressed={ isSelected }
								aria-label={ source.description }
								variant="secondary"
								onClick={ () => onToggleSource( source.value ) }
							>
								{ source.label }
							</Button>
						</Tooltip>
					);
				} ) }
			</ButtonGroup>
		</ToolsPanel>
	);
}
