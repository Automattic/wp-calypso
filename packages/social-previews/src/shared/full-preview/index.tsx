import { ExternalLink } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import SectionHeading from '../section-heading';

import './styles.scss';

type Props = {
	network: string;
	postPreview: React.ReactNode;
	linkPreview: React.ReactNode;
	headingsLevel?: number;
};

const FullPreview: React.FC< Props > = ( { network, postPreview, linkPreview, headingsLevel } ) => {
	const namespace = `${ network }-preview`;
	const rootClassName = `social-preview ${ namespace }`;
	const sectionClassName = `social-preview__section ${ namespace }__section`;

	return (
		<div className={ rootClassName }>
			<section className={ sectionClassName }>
				<SectionHeading level={ headingsLevel }>
					{
						// translators: a post in a social network
						__( 'Your post', 'social-previews' )
					}
				</SectionHeading>
				<p className="social-preview__section-desc">
					{ sprintf(
						// translators: %s is the name of a social network, e.g., Tumblr
						__( 'This is what your social post will look like on %s:', 'social-previews' ),
						network
					) }
				</p>
				{ postPreview }
			</section>
			<section className={ sectionClassName }>
				<SectionHeading level={ headingsLevel }>
					{
						// translators: a link previewed in a social network
						__( 'Link preview', 'social-previews' )
					}
				</SectionHeading>
				<p className="social-preview__section-desc">
					{ sprintf(
						// translators: %s is the name of a social network, e.g., Tumblr
						__(
							'This is what it will look like when someone shares the link to your WordPress post on %s.',
							'social-previews'
						),
						network
					) }
					&nbsp;
					<ExternalLink href="https://jetpack.com/support/jetpack-social-image-generator">
						{ __( 'Learn more about links', 'social-previews' ) }
					</ExternalLink>
				</p>
				{ linkPreview }
			</section>
		</div>
	);
};

export default FullPreview;
