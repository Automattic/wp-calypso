import { Card } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import SiteIcon from '../site-icon';
import SitePreview from '../site-preview';
import type { Site } from '../../data/types';

const SitePreviewCard = ( { site }: { site: Site } ) => {
	const [ resizeListener, { width, height } ] = useResizeObserver();
	const { URL: url, is_a8c, is_private } = site;

	// If the site is a private A8C site, X-Frame-Options is set to same origin.
	const iframeDisabled = is_a8c && is_private;

	return (
		<Card style={ { overflow: 'hidden' } }>
			{ resizeListener }
			{ iframeDisabled && (
				<div
					style={ {
						fontSize: '24px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						height: '100%',
					} }
				>
					<SiteIcon site={ site } />
				</div>
			) }
			{ !! width && !! height && ! iframeDisabled && (
				<div
					style={ {
						position: 'absolute',
						top: 0,
						right: 0,
						bottom: 0,
						left: 0,
						overflow: 'hidden',
						backgroundColor: '#f0f0f0',
					} }
				>
					<SitePreview url={ url } scale={ width / 1200 } height={ height / ( width / 1200 ) } />
				</div>
			) }
		</Card>
	);
};

export default SitePreviewCard;
