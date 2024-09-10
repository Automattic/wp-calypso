import page from '@automattic/calypso-router';
import { MaterialIcon } from '@automattic/components';
import { useHasEnTranslation, useLocalizeUrl } from '@automattic/i18n-utils';
import { useOpenZendeskMessaging } from '@automattic/zendesk-client';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import imgConnectDomain from 'calypso/assets/images/cancellation/connect-domain.png';
import imgFreeDomain from 'calypso/assets/images/cancellation/free-domain.png';
import imgLoadingTime from 'calypso/assets/images/cancellation/loading-time.png';
import imgSEO from 'calypso/assets/images/cancellation/seo.png';
import FormattedHeader from 'calypso/components/formatted-header';
import type { UpsellType } from '../get-upsell-type';
import type { SiteDetails } from '@automattic/data-stores';
import type { TranslateResult } from 'i18n-calypso';

type ContentProps = {
	children: React.ReactNode[];
	image: string;
	title: TranslateResult;
	declineButtonText?: TranslateResult;
	onAccept?: () => void;
	onDecline: () => void;
};

function Content( { image, ...props }: ContentProps ) {
	const translate = useTranslate();
	const declineButtonText = props.declineButtonText || translate( 'Cancel my current plan' );
	const [ isBusy, setIsBusy ] = useState( false );
	const styles: Record< string, string > = {};

	return (
		<div className="cancel-purchase-form__edu">
			<div className="cancel-purchase-form__edu-header-group">
				<div className="cancel-purchase-form__edu-header-text-group">
					<div className="cancel-purchase-form__edu-subheader">
						{ translate( 'Let’s try this' ) }
					</div>
					<FormattedHeader brandFont headerText={ props.title } />
				</div>
				<div className="cancel-purchase-form__edu-image-container" style={ styles }>
					<img className="cancel-purchase-form__edu-image" src={ image } alt="" />
				</div>
			</div>
			<div className="cancel-purchase-form__edu-content">
				<div className="cancel-purchase-form__edu-text">{ props.children }</div>
				<div className="cancel-purchase-form__edu-buttons">
					<p>{ translate( 'Thanks, but this is not what I need' ) }</p>
					<Button
						variant="secondary"
						onClick={ () => {
							setIsBusy( true );
							props.onDecline?.();
						} }
						isBusy={ isBusy }
						disabled={ isBusy }
					>
						{ declineButtonText }
					</Button>
				</div>
			</div>
		</div>
	);
}

type StepProps = {
	type: UpsellType;
	site: SiteDetails;
	onDecline: () => void;
	cancellationReason: string;
};

export default function EducationalCotnentStep( { type, site, ...props }: StepProps ) {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const localizeUrl = useLocalizeUrl();
	const { isOpeningZendeskWidget, openZendeskWidget } =
		useOpenZendeskMessaging( 'pre-cancellation' );

	switch ( type ) {
		case 'education:loading-time':
			return (
				<Content
					image={ imgLoadingTime }
					title={ translate( 'Loading times best practices' ) }
					onDecline={ props.onDecline }
				>
					<p>
						{ translate(
							'A few common factors can slow down your site. You may want to try some of these fixes to improve your site’s loading time.'
						) }
					</p>
					<ul className="cancel-purchase-form__edu-icon-list">
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<MaterialIcon icon="power" size={ 24 } />
							</div>
							<div>
								{ translate(
									'Uninstall any unnecessary plugins. Sites with too many third-party plugins installed can take longer to load.'
								) }
							</div>
						</li>
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<MaterialIcon icon="palette" size={ 24 } />
							</div>
							<div>
								{ translate(
									'Make sure you’re using a fast theme. Some themes come packed with extra features that can slow down your site.'
								) }
							</div>
						</li>
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<MaterialIcon icon="photo_library" size={ 24 } />
							</div>
							<div>
								{ translate(
									'Optimize your images before uploading them. Unnecessarily large image files take longer to load.'
								) }
							</div>
						</li>
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<MaterialIcon icon="library_books" size={ 24 } />
							</div>
							<div>
								{ translate(
									'Read more about how to improve your site’s speed and performance {{link}}here{{/link}}.',
									{
										components: {
											link: (
												<Button
													href={ localizeUrl( 'https://wordpress.com/support/site-speed/' ) }
													variant="link"
												/>
											),
										},
									}
								) }
							</div>
						</li>
					</ul>
				</Content>
			);
		case 'education:free-domain':
			return (
				<Content
					image={ imgFreeDomain }
					title={ translate( 'Step-by-step guide to get a free domain' ) }
					onDecline={ props.onDecline }
				>
					<p>
						{ translate(
							'You can register a free domain name for one year with the purchase of any WordPress.com annual or two-year plan!'
						) }
					</p>
					<ul>
						<li>
							{ translate(
								'Go to Upgrades → Domains and click {{link}}Add a Domain{{/link}} to register your plan’s free domain',
								{
									components: {
										link: <Button href={ `/domains/add/${ site.slug }` } variant="link" />,
									},
								}
							) }
						</li>
						<li>
							{ translate(
								'Choose from all popular extensions including .com, .org, .net, .shop, and .blog.'
							) }
						</li>
						<li>
							{ translate(
								'Make it your site’s primary domain (no “WordPress.com” in the address!)'
							) }
						</li>
						<li>
							{ translate( 'After the first year, your domain will renew at the regular price.' ) }
						</li>
						<li>
							{ translate(
								'If you have trouble claiming your free domain, contact us and we’ll assist you.'
							) }
						</li>
						<li>
							{ translate( 'Read more about domains {{link}}here{{/link}}.', {
								components: {
									link: (
										<Button
											href={ localizeUrl(
												'https://wordpress.com/support/domains/register-domain/'
											) }
											variant="link"
										/>
									),
								},
							} ) }
						</li>
					</ul>
				</Content>
			);
		case 'education:domain-connection':
			return (
				<Content
					image={ imgConnectDomain }
					title={ translate( 'Connect a domain guidelines' ) }
					onDecline={ props.onDecline }
				>
					<p>
						{ translate(
							'If you’ve already gone through the steps to {{link}}connect your domain{{/link}} to your website and are still having issues, please keep in mind that the DNS changes can take up to 72 hours to fully propagate, during which time the domain might not load properly. You can also:',
							{
								components: {
									link: (
										<Button
											href={ localizeUrl(
												'https://wordpress.com/support/domains/connect-existing-domain/#steps-to-connect-a-domain'
											) }
											variant="link"
										/>
									),
								},
							}
						) }
					</p>
					<ul>
						<li>
							{ translate(
								'Try clearing your browser’s cache to ensure your browser is loading the most up‑to‑date information.'
							) }
						</li>
						<li>
							{ translate(
								'Contact your domain registrar to ensure the name servers were correctly changed (and the old ones were removed entirely).'
							) }
						</li>
						<li>
							{ hasEnTranslation(
								'Read more about domain connection {{link}}here{{/link}} or {{chat}}contact us{{/chat}} right now.'
							)
								? translate(
										'Read more about domain connection {{link}}here{{/link}} or {{chat}}contact us{{/chat}} right now.',
										{
											components: {
												link: (
													<Button
														href={ localizeUrl(
															'https://wordpress.com/support/domains/connect-existing-domain/'
														) }
														variant="link"
													/>
												),
												chat: (
													<Button
														isBusy={ isOpeningZendeskWidget }
														disabled={ isOpeningZendeskWidget }
														onClick={ () => {
															page( `/domains/manage/${ site.slug }` );
															openZendeskWidget( {
																message:
																	"User is contacting us from pre-cancellation form. Cancellation reason they've given: " +
																	props.cancellationReason,
																siteUrl: site.URL,
																siteId: site.ID,
															} );
														} }
														variant="link"
													/>
												),
											},
										}
								  )
								: translate(
										'Read more about domain connection {{link}}here{{/link}} or {{chat}}chat with a real person{{/chat}} right now.',
										{
											components: {
												link: (
													<Button
														href={ localizeUrl(
															'https://wordpress.com/support/domains/connect-existing-domain/'
														) }
														variant="link"
													/>
												),
												chat: (
													<Button
														isBusy={ isOpeningZendeskWidget }
														disabled={ isOpeningZendeskWidget }
														onClick={ () => {
															page( `/domains/manage/${ site.slug }` );
															openZendeskWidget( {
																message:
																	"User is contacting us from pre-cancellation form. Cancellation reason they've given: " +
																	props.cancellationReason,
																siteUrl: site.URL,
																siteId: site.ID,
															} );
														} }
														variant="link"
													/>
												),
											},
										}
								  ) }
						</li>
					</ul>
				</Content>
			);
		case 'education:seo':
			return (
				<Content
					image={ imgSEO }
					title={ translate( 'Improve your SEO guidelines' ) }
					onDecline={ props.onDecline }
				>
					<p>
						{ translate(
							'If you want your site to rank higher on Google and other search engines, you may want to consider these SEO essentials.'
						) }
					</p>
					<ul className="cancel-purchase-form__edu-icon-list">
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<MaterialIcon icon="keyboard" size={ 24 } />
							</div>
							<div>
								{ translate(
									'Research your keywords: Figure out which keywords you want your site to rank for. Work these specific keywords into your titles, headings, content, and URL slugs.'
								) }
							</div>
						</li>
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<MaterialIcon icon="library_books" size={ 24 } />
							</div>
							<div>
								{ translate(
									'Post new content regularly: The more you post, the higher the chance of a strong search ranking. Google likes blogs that update frequently.'
								) }
							</div>
						</li>
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<MaterialIcon icon="share" size={ 24 } />
							</div>
							<div>
								{ translate(
									'Share your site: Automatically share your posts to social media when you publish them. The more organic traffic your site gets, the better it looks to search engines.'
								) }
							</div>
						</li>
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<MaterialIcon icon="check_circle" size={ 24 } />
							</div>
							<div>
								{ translate(
									'Verify your site with search engines: Add your site to Google Search Console and other search engines to speed up the site indexing process.'
								) }
							</div>
						</li>
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<MaterialIcon icon="play_circle_outline" size={ 24 } />
							</div>
							<div>
								{ translate(
									'Find other tips to optimize your site for search engines {{link}}here{{/link}}. If you’re looking for a full introduction to Search Engine Optimization, you can join our {{seo}}free SEO course{{/seo}}.',
									{
										components: {
											link: (
												<Button
													href={ localizeUrl( 'https://wordpress.com/support/seo/' ) }
													variant="link"
												/>
											),
											seo: (
												<Button
													href="https://wordpress.com/learn/courses/intro-to-seo/"
													variant="link"
												/>
											),
										},
									}
								) }
							</div>
						</li>
					</ul>
				</Content>
			);
	}

	return null;
}
