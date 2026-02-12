import { useHasEnTranslation, localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Icon,
	plugins,
	brush,
	gallery,
	pages,
	keyboard,
	share,
	published,
	video,
} from '@wordpress/icons';
import { useState } from 'react';
import * as React from 'react';
import imgConnectDomain from 'calypso/assets/images/cancellation/connect-domain.png';
import imgLoadingTime from 'calypso/assets/images/cancellation/loading-time.png';
import imgSEO from 'calypso/assets/images/cancellation/seo.png';
import { useHelpCenter } from '../../../../../app/help-center';
import { PageHeader } from '../../../../../components/page-header';

type ContentProps = {
	children: React.ReactNode[];
	image: string;
	title: string;
	onAccept?: () => void;
	onDecline?: () => void;
};

function Content( { image, ...props }: ContentProps ) {
	const declineButtonText = __( 'Cancel my current plan' );
	const [ isBusy, setIsBusy ] = useState( false );
	const styles: Record< string, string > = {};

	return (
		<div className="cancel-purchase-form__edu">
			<div className="cancel-purchase-form__edu-header-group">
				<div className="cancel-purchase-form__edu-header-text-group">
					<div className="cancel-purchase-form__edu-subheader">{ __( 'Let’s try this' ) }</div>
					<PageHeader title={ props.title } />
				</div>
				<div className="cancel-purchase-form__edu-image-container" style={ styles }>
					<img className="cancel-purchase-form__edu-image" src={ image } alt="" />
				</div>
			</div>
			<div className="cancel-purchase-form__edu-content">
				<div className="cancel-purchase-form__edu-text">{ props.children }</div>
				<div className="cancel-purchase-form__edu-buttons">
					<p>{ __( 'Thanks, but this is not what I need' ) }</p>
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
	type: string;
	siteSlug: string;
	onDecline?: () => void;
	cancellationReason?: string;
};

export default function EducationalContentStep( { type, siteSlug, ...props }: StepProps ) {
	const { setShowHelpCenter, setSubject } = useHelpCenter();
	const hasEnTranslation = useHasEnTranslation();

	const onRequestHelpClick = () => {
		const initialMessage =
			"User is contacting us from pre-cancellation form. Cancellation reason they've given: " +
			props.cancellationReason;

		setSubject( initialMessage );
		setShowHelpCenter( true );
	};

	switch ( type ) {
		case 'education:loading-time':
			return (
				<Content
					image={ imgLoadingTime }
					title={ __( 'Loading times best practices' ) }
					onDecline={ props.onDecline }
				>
					<p>
						{ __(
							'A few common factors can slow down your site. You may want to try some of these fixes to improve your site’s loading time.'
						) }
					</p>
					<ul className="cancel-purchase-form__edu-icon-list">
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<Icon icon={ plugins } size={ 24 } />
							</div>
							<div>
								{ __(
									'Uninstall any unnecessary plugins. Sites with too many third-party plugins installed can take longer to load.'
								) }
							</div>
						</li>
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<Icon icon={ brush } size={ 24 } />
							</div>
							<div>
								{ __(
									'Make sure you’re using a fast theme. Some themes come packed with extra features that can slow down your site.'
								) }
							</div>
						</li>
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<Icon icon={ gallery } size={ 24 } />
							</div>
							<div>
								{ __(
									'Optimize your images before uploading them. Unnecessarily large image files take longer to load.'
								) }
							</div>
						</li>
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<Icon icon={ pages } size={ 24 } />
							</div>
							<div>
								{ createInterpolateElement(
									__(
										'Read more about how to improve your site’s speed and performance <link>here</link>.'
									),
									{
										link: (
											<Button
												href={ localizeUrl( 'https://wordpress.com/support/site-speed/' ) }
												variant="link"
											/>
										),
									}
								) }
							</div>
						</li>
					</ul>
				</Content>
			);
		case 'education:domain-connection':
			return (
				<Content
					image={ imgConnectDomain }
					title={ __( 'Connect a domain guidelines' ) }
					onDecline={ props.onDecline }
				>
					<p>
						{ createInterpolateElement(
							__(
								'If you’ve already gone through the steps to <link>connect your domain</link> to your website and are still having issues, please keep in mind that the DNS changes can take up to 72 hours to fully propagate, during which time the domain might not load properly. You can also:'
							),
							{
								link: (
									<Button
										href={ localizeUrl(
											'https://wordpress.com/support/domains/connect-existing-domain/#steps-to-connect-a-domain'
										) }
										variant="link"
									/>
								),
							}
						) }
					</p>
					<ul>
						<li>
							{ __(
								'Try clearing your browser’s cache to ensure your browser is loading the most up‑to‑date information.'
							) }
						</li>
						<li>
							{ __(
								'Contact your domain registrar to ensure the name servers were correctly changed (and the old ones were removed entirely).'
							) }
						</li>
						<li>
							{ hasEnTranslation(
								'Read more about domain connection <link>here</link> or <chat>contact us</chat> right now.'
							)
								? createInterpolateElement(
										__(
											'Read more about domain connection <link>here</link> or <chat>contact us</chat> right now.'
										),
										{
											link: (
												<Button
													href={ localizeUrl(
														'https://wordpress.com/support/domains/connect-existing-domain/'
													) }
													variant="link"
												/>
											),
											chat: <Button onClick={ onRequestHelpClick } variant="link" />,
										}
								  )
								: createInterpolateElement(
										__(
											'Read more about domain connection <link>here</link> or <chat>chat with a real person</chat> right now.'
										),
										{
											link: (
												<Button
													href={ localizeUrl(
														'https://wordpress.com/support/domains/connect-existing-domain/'
													) }
													variant="link"
												/>
											),
											chat: <Button onClick={ onRequestHelpClick } variant="link" />,
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
					title={ __( 'Improve your SEO guidelines' ) }
					onDecline={ props.onDecline }
				>
					<p>
						{ __(
							'If you want your site to rank higher on Google and other search engines, you may want to consider these SEO essentials.'
						) }
					</p>
					<ul className="cancel-purchase-form__edu-icon-list">
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<Icon icon={ keyboard } size={ 24 } />
							</div>
							<div>
								{ __(
									'Research your keywords: Figure out which keywords you want your site to rank for. Work these specific keywords into your titles, headings, content, and URL slugs.'
								) }
							</div>
						</li>
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<Icon icon={ pages } size={ 24 } />
							</div>
							<div>
								{ __(
									'Post new content regularly: The more you post, the higher the chance of a strong search ranking. Google likes blogs that update frequently.'
								) }
							</div>
						</li>
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<Icon icon={ share } size={ 24 } />
							</div>
							<div>
								{ __(
									'Share your site: Automatically share your posts to social media when you publish them. The more organic traffic your site gets, the better it looks to search engines.'
								) }
							</div>
						</li>
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<Icon icon={ published } size={ 24 } />
							</div>
							<div>
								{ __(
									'Verify your site with search engines: Add your site to Google Search Console and other search engines to speed up the site indexing process.'
								) }
							</div>
						</li>
						<li>
							<div className="cancel-purchase-form__edu-icon">
								<Icon icon={ video } size={ 24 } />
							</div>
							<div>
								{ createInterpolateElement(
									__(
										'Find other tips to optimize your site for search engines <link>here</link>. If you’re looking for a full introduction to Search Engine Optimization, you can join our <seo>free SEO course</seo>.'
									),
									{
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
