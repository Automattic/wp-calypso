import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import FoldableFAQ from 'calypso/components/foldable-faq';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import type { FC } from 'react';

import './styles.scss';

const DomainTransferFAQ: FC = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	const onFaqToggle = useCallback(
		( faqArgs: { id: string; buttonId: string; isExpanded: boolean; height: number } ) => {
			const { id, buttonId, isExpanded } = faqArgs;
			const tracksArgs = {
				site_id: siteId,
				faq_id: id,
			};

			const removeHash = () => {
				history.replaceState( '', document.title, location.pathname + location.search );
			};

			// Add expanded FAQ buttonId to the URL hash
			const addHash = () => {
				history.replaceState(
					'',
					document.title,
					location.pathname + location.search + `#${ buttonId }`
				);
			};

			if ( isExpanded ) {
				addHash();
				// FAQ opened
				dispatch( recordTracksEvent( 'calypso_domain_transfer_faq_open', tracksArgs ) );
			} else {
				removeHash();
				// FAQ closed
				dispatch( recordTracksEvent( 'calypso_domain_transfer_faq_closed', tracksArgs ) );
			}
		},
		[ siteId, dispatch ]
	);

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<>
			<section>
				<h2>{ translate( 'Frequently Asked Questions' ) }</h2>
				<ul>
					<li>
						<FoldableFAQ
							id="service-down"
							question={ translate(
								'Will my website or email service be down during the transfer?'
							) }
							onToggle={ onFaqToggle }
							className="domain-transfer-faq__section"
						>
							{ translate(
								'If your website and email settings were correctly configured before the transfer, there should be no downtime.'
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="time-left"
							question={ translate(
								'Do I lose the time left with my current registrar when I transfer?'
							) }
							onToggle={ onFaqToggle }
							className="domain-transfer-faq__section"
						>
							{ translate(
								'No, when you transfer your domain, the remaining time you had left with your old registrar ' +
									'is transferred over. In addition, we give you another free years registration when you ' +
									'transfer from Google Domains.'
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="dns-settings"
							question={ translate(
								'Will my custom name server DNS settings automatically be transferred over?'
							) }
							onToggle={ onFaqToggle }
							className="domain-transfer-faq__section"
						>
							{ translate(
								'When you transfer a domain name to WordPress.com, we will leave the nameserver associated with , ' +
									'the domain unchanged so your DNS records will continue keep working the same as before the transfer.'
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="how-long"
							question={ translate( 'How long does it take to transfer a domain name?' ) }
							onToggle={ onFaqToggle }
							className="domain-transfer-faq__section"
						>
							{ translate(
								'The entire process generally takes a couple of days. The time it takes varies depending on the ' +
									'registrar you are transferring the domain from, and the time it takes your current registrar ' +
									'to complete the process. You can check the progress of your transfer in the Domain Management section of ' +
									'your WordPress.com dashboard.'
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="transfer-fails"
							question={ translate( 'What happens if my domain transfer fails?' ) }
							onToggle={ onFaqToggle }
							className="domain-transfer-faq__section"
						>
							{ translate(
								'If your domain transfer fails, your domain will remain with your current registrar. You will ' +
									'need to resolve any issues that caused the transfer failure before attempting to transfer again.'
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="privacy-protection"
							question={ translate( 'Will privacy protection be turned on by default?' ) }
							onToggle={ onFaqToggle }
							className="domain-transfer-faq__section"
						>
							{ translate(
								'Yes. Privacy protection is turned on by default for all domains transferred to WordPress.com.'
							) }
						</FoldableFAQ>
					</li>
				</ul>
			</section>
		</>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default DomainTransferFAQ;
