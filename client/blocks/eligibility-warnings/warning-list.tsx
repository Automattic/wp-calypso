import { Card, Badge, ExternalLink } from '@automattic/components';
import DOMPurify from 'dompurify';
import { localize, LocalizeProps, translate } from 'i18n-calypso';
import { Fragment, useEffect, useRef } from 'react';
import ActionPanelLink from 'calypso/components/action-panel/link';
import useSupportDocData from 'calypso/components/inline-support-link/use-support-doc-data';
import type { DomainNames, EligibilityWarning } from 'calypso/state/automated-transfer/selectors';

interface ExternalProps {
	context: string | null;
	warnings: EligibilityWarning[];
	showContact?: boolean;
}

type Props = ExternalProps & LocalizeProps;

const WP_ADMIN_HELP_CENTER_LINK_SELECTOR = 'a';
// TODO: Update wpcom to match this
// const WP_ADMIN_HELP_CENTER_LINK_SELECTOR = 'a[data-help-center-link]';

export const WarningList = ( { context, translate, warnings, showContact = true }: Props ) => {
	const descriptionRef = useRef< HTMLSpanElement >( null );
	const { openSupportDoc, supportDocData, setSupportDocData } = useSupportDocData( {} );

	useEffect( () => {
		const link = descriptionRef.current?.querySelector( WP_ADMIN_HELP_CENTER_LINK_SELECTOR );

		if ( link && ! supportDocData?.link ) {
			setSupportDocData( {
				link: link.getAttribute( 'href' ) || '',
			} );
		}
	} );

	// Keep the click handler up to date with the latest `openSupportDoc` function.
	useEffect( () => {
		const link = descriptionRef.current?.querySelector( WP_ADMIN_HELP_CENTER_LINK_SELECTOR );

		if ( ! link ) {
			return;
		}

		const onClick = ( event: Event ) => {
			event.preventDefault();
			// TODO: Investigate `findDOMNode` error that's preventing correct scrolling (might get solved once the data attribute is in place?)
			openSupportDoc();
		};

		link.addEventListener( 'click', onClick );
		return () => {
			link.removeEventListener( 'click', onClick );
		};
	}, [ openSupportDoc ] );

	return (
		<div>
			{ warnings.map( ( { name, description, supportUrl, domainNames }, index ) => (
				<div className="eligibility-warnings__warning" key={ index }>
					<div className="eligibility-warnings__message">
						{ context !== 'plugin-details' && context !== 'hosting-features' && (
							<Fragment>
								<span className="eligibility-warnings__message-title">{ name }</span>:&nbsp;
							</Fragment>
						) }
						<span className="eligibility-warnings__message-description" ref={ descriptionRef }>
							<span
								dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize( description ) } } // eslint-disable-line react/no-danger
							/>
							{ domainNames && displayDomainNames( domainNames ) }
							{ supportUrl && (
								<ExternalLink href={ supportUrl } target="_blank">
									{ translate( 'Learn more.' ) }
								</ExternalLink>
							) }
						</span>
					</div>
				</div>
			) ) }

			{ showContact && (
				<div className="eligibility-warnings__warning">
					<div className="eligibility-warnings__message">
						<span className="eligibility-warnings__message-description">
							{ translate( '{{a}}Contact support{{/a}} for help and questions.', {
								components: {
									a: <ActionPanelLink href="/help/contact" />,
								},
							} ) }
						</span>
					</div>
				</div>
			) }
		</div>
	);
};

function displayDomainNames( domainNames: DomainNames ) {
	//Split out the first part of the domain names and then join the rest back together.
	const domainNamesArrayCurrent = domainNames.current.split( '.' );
	const domainNamesArrayNew = domainNames.new.split( '.' );
	const firstPartCurrent = domainNamesArrayCurrent.shift();
	const firstPartNew = domainNamesArrayNew.shift();
	const secondPartCurrent = '.' + domainNamesArrayCurrent.join( '.' );
	const secondPartNew = '.' + domainNamesArrayNew.join( '.' );

	return (
		<div className="eligibility-warnings__domain-names">
			<Card compact>
				<span className="eligibility-warnings__address-first">{ firstPartCurrent }</span>
				<span className="eligibility-warnings__address-second">{ secondPartCurrent }</span>
				<Badge type="info">{ translate( 'current' ) }</Badge>
			</Card>
			<Card compact>
				<span className="eligibility-warnings__address-first">{ firstPartNew }</span>
				<span className="eligibility-warnings__address-second">{ secondPartNew }</span>
				<Badge type="success">{ translate( 'new' ) }</Badge>
			</Card>
		</div>
	);
}

export default localize( WarningList );
