import {
	Button,
	__experimentalHeading as Heading,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { DomainSearchSkipSuggestionPlaceholder } from './index.placeholder';
import { DomainSearchSkipSuggestionSkeleton } from './index.skeleton';

import './style.scss';

interface Props {
	freeSuggestion?: string;
	unavailableDomain?: string;
	existingSiteUrl?: string;
	onSkip: () => void;
	onSuggestionClick?: () => void;
	disabled?: boolean;
	isBusy?: boolean;
}

const DomainSearchSkipSuggestion = ( {
	freeSuggestion,
	unavailableDomain,
	existingSiteUrl,
	onSkip,
	onSuggestionClick,
	disabled,
	isBusy,
}: Props ) => {
	let title;
	let subtitle;
	let buttonText = __( 'Skip purchase' );
	let showButton = true;

	if ( existingSiteUrl ) {
		const [ domain, ...tld ] = existingSiteUrl.split( '.' );

		title = __( 'Current address' );
		subtitle = createInterpolateElement(
			sprintf(
				// translators: %(domain)s is the domain name, %(tld)s is the top-level domain
				__( 'Keep <domain>%(domain)s<tld>.%(tld)s</tld></domain> as your site address' ),
				{
					domain,
					tld: tld.join( '.' ),
				}
			),
			{
				domain: <span style={ { wordBreak: 'break-word', hyphens: 'none' } } />,
				tld: <strong style={ { whiteSpace: 'nowrap' } } />,
			}
		);
	} else if ( freeSuggestion && unavailableDomain ) {
		title = sprintf(
			// translators: %(domain)s is the WordPress.com subdomain the user searched for
			__( '%(domain)s is not available' ),
			{ domain: unavailableDomain }
		);
		subtitle = createInterpolateElement(
			sprintf(
				// translators: %(suggestion)s is an alternative free WordPress.com subdomain
				__( 'Try <link>%(suggestion)s</link> instead?' ),
				{ suggestion: freeSuggestion }
			),
			{
				link: <Button variant="link" onClick={ () => onSuggestionClick?.() } />,
			}
		);
		showButton = false;
	} else if ( freeSuggestion ) {
		title = sprintf(
			// translators: %(domain)s is the free WordPress.com subdomain
			__( 'Start free with %(domain)s' ),
			{ domain: freeSuggestion }
		);
		subtitle = __( 'Upgrade to a custom domain name anytime.' );
		buttonText = __( 'Start Free' );
	}

	if ( ! title ) {
		return null;
	}

	const domain = existingSiteUrl ?? freeSuggestion;

	return (
		<DomainSearchSkipSuggestionSkeleton
			title={
				<Heading level="4" weight="normal">
					{ title }
				</Heading>
			}
			subtitle={ subtitle && <Text>{ subtitle }</Text> }
			right={
				showButton ? (
					<Button
						className="domain-search-skip-suggestion__btn"
						variant="secondary"
						// translators: %(domain)s is the domain name
						label={ sprintf( __( 'Skip purchase and continue with %(domain)s' ), {
							domain,
						} ) }
						onClick={ onSkip }
						disabled={ disabled }
						isBusy={ isBusy && ! disabled }
						__next40pxDefaultSize
					>
						{ buttonText }
					</Button>
				) : undefined
			}
		/>
	);
};

DomainSearchSkipSuggestion.Placeholder = DomainSearchSkipSuggestionPlaceholder;

export { DomainSearchSkipSuggestion };
