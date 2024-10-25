import { Button, Dialog } from '@automattic/components';
import styled from '@emotion/styled';
import { numberFormat, useTranslate } from 'i18n-calypso';
import { CHARACTER_LIMIT } from './section-types/constants';

const DialogContent = styled.div`
	padding: 16px;
	p {
		font-size: 1rem;
		color: var( --studio-gray-50 );
	}
	ul {
		margin-inline-start: 1rem;
	}
	li {
		margin-bottom: 1rem;
	}
`;

const DialogButton = styled( Button )`
	box-shadow: 0px 1px 2px rgba( 0, 0, 0, 0.05 );
	border-radius: 5px;
	padding: ${ ( props ) => ( props.primary ? '10px 64px' : '10px 32px' ) };
	--color-accent: #117ac9;
	--color-accent-60: #0e64a5;
	.gridicon {
		margin-left: 10px;
	}
`;

export function ConfirmDialog( {
	isConfirmDialogOpen,
	setIsConfirmDialogOpen,
	onSubmit,
}: {
	isConfirmDialogOpen: boolean;
	setIsConfirmDialogOpen: ( arg0: boolean ) => void;
	onSubmit: () => void;
} ) {
	const translate = useTranslate();
	const dialogButtons = [
		<DialogButton key="cancel" onClick={ () => setIsConfirmDialogOpen( false ) }>
			{ translate( 'Cancel' ) }
		</DialogButton>,
		<DialogButton key="submit" primary onClick={ onSubmit }>
			{ translate( 'Submit' ) }
		</DialogButton>,
	];
	return (
		<Dialog
			isVisible={ isConfirmDialogOpen }
			onClose={ () => setIsConfirmDialogOpen( false ) }
			buttons={ dialogButtons }
		>
			<DialogContent>
				<h1>{ translate( 'Are you ready to submit your content?' ) }</h1>
				<p>
					{ translate(
						'If you have reviewed our content guidelines and added your final content to the form, click “Submit” to send us your content. If everything meets our guidelines, we’ll build your new site and email you the details within %d business days. If adjustments are needed, we’ll reach out.',
						{
							args: [ 4 ],
						}
					) }
				</p>
			</DialogContent>
		</Dialog>
	);
}

export function ContentGuidelinesDialog( {
	isContentGuidelinesDialogOpen,
	setIsContentGuidelinesDialogOpen,
}: {
	isContentGuidelinesDialogOpen: boolean;
	setIsContentGuidelinesDialogOpen: ( arg0: boolean ) => void;
} ) {
	const translate = useTranslate();

	return (
		<Dialog
			isVisible={ isContentGuidelinesDialogOpen }
			onClose={ () => setIsContentGuidelinesDialogOpen( false ) }
			buttons={ [
				<DialogButton
					key="primary"
					primary
					onClick={ () => setIsContentGuidelinesDialogOpen( false ) }
				>
					{ translate( 'Acknowledge & Continue' ) }
				</DialogButton>,
			] }
		>
			<DialogContent>
				<h1>{ translate( 'We look forward to building your site!' ) }</h1>
				<p>{ translate( 'Please review the following content submission guidelines:' ) }</p>
				<ul>
					<li>
						{ translate(
							'{{strong}}Fresh Content Only:{{/strong}} Please provide original content rather than requesting migrations or content from existing pages, external websites, or files.',
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</li>
					<li>
						{ translate(
							"{{strong}}Timely Submission:{{/strong}} Submit your content {{strong}}within %(refundPeriodDays)d days{{/strong}} of purchase to keep things on track. If we don't receive it in time, we'll use AI-generated text and stock images based on your search terms to bring your site to life.",
							{
								components: {
									strong: <strong />,
								},
								args: {
									refundPeriodDays: 14,
								},
							}
						) }
					</li>
					<li>
						{ translate(
							'{{strong}}Bite-sized Content:{{/strong}} Keep each page under %s characters. Longer content will be trimmed using AI to ensure everything looks great.',
							{
								components: {
									strong: <strong />,
								},
								args: [ numberFormat( CHARACTER_LIMIT, {} ) ],
							}
						) }
					</li>
					<li>
						{ translate(
							"{{strong}}Design Approach:{{/strong}} We follow established design guidelines while customizing your site to reflect your brand. With your logo, colors, and style preferences, we'll create a professional site that captures your essence using our curated design elements.",
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</li>
					<li>
						{ translate(
							"{{strong}}Stay Connected:{{/strong}} After you submit your content, we'll review it. If everything meets our guidelines, we'll notify you when your site is ready for launch. If adjustments are needed, we'll reach out.",
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</li>
					<li>
						{ translate(
							"{{strong}}Perfect As-Is:{{/strong}} We aim to get it right the first time! While revisions aren't included, you can always make updates later using the WordPress editor.",
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</li>
					<li>
						{ translate(
							"{{strong}}Plugin Potential:{{/strong}} The initial setup doesn't include every feature, but it's a great starting point. Add options like appointments, courses, property listings, memberships, payments, animations, and more after we finish your site. Our Happiness Engineers can make recommendations based on your plan.",
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</li>
					<li>
						{ translate(
							"{{strong}}Custom Requests:{{/strong}} We focus on attractive and functional designs, but we can't accommodate very specific layout requests or exact matches to designs. For fully custom solutions or pixel-perfect recreations, we can connect you with an expert WordPress agency partner, with projects starting at $5,000.",
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</li>
				</ul>
			</DialogContent>
		</Dialog>
	);
}
