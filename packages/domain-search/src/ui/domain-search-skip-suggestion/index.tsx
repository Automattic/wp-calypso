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
	existingSiteUrl?: string;
	onSkip: () => void;
	disabled?: boolean;
	isBusy?: boolean;
}

const DomainSearchSkipSuggestion = ( {
	freeSuggestion,
	existingSiteUrl,
	onSkip,
	disabled,
	isBusy,
}: Props ) => {
	let title;
	let subtitle;
	let buttonText = __( 'Skip purchase' );

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
	} else if ( freeSuggestion ) {
		title = __( 'Start free with a WordPress.com subdomain' );
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
				<Button
					className="domain-search-skip-suggestion__btn"
					variant="secondary"
					// translators: %(domain)s is the domain name
					label={ sprintf( __( 'Skip purchase and continue with %(domain)s' ), { domain } ) }
					onClick={ onSkip }
					disabled={ disabled }
					isBusy={ isBusy && ! disabled }
					__next40pxDefaultSize
				>
					{ buttonText }
				</Button>
			}
		/>
	);
};

DomainSearchSkipSuggestion.Placeholder = DomainSearchSkipSuggestionPlaceholder;

export { DomainSearchSkipSuggestion };
