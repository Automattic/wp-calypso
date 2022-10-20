import { translate } from 'i18n-calypso';
import expiredIllustration from 'calypso/assets/images/customer-home/disconnected-dark.svg';

export const getTask = ( context: any = {} ) => {
	// TODO somehow we will need to decide which task details to return based on some context.
	const { siteSlug } = context;

	let taskDetails = {
		heading: translate( 'Repurchase your plan' ),
		body: translate(
			'Your plan expired and your site has reverted back to features available on the Free plan. If you would like to continue using your previous features you must first repurchase an eligible plan.{{lineBreak/}}If you wish to continue with Free plan features no further action is needed.',
			{
				components: {
					lineBreak: (
						<>
							<br />
							<br />
						</>
					),
				},
			}
		),
		buttonText: translate( 'Repurchase plan' ),
		buttonLink: `/plans/${ siteSlug }`,
		illustration: expiredIllustration,
	};

	//TODO remove this temp code.
	const params = new URLSearchParams( window.location.search );

	if ( params.get( 'revivalType' ) === '2' ) {
		taskDetails = {
			heading: translate( 'Your features are restored' ),
			body: translate(
				'Your site now has access to %(plan)s features again. To begin using these features you can either activate them via {{hosting}}Settings > Hosting Config{{/hosting}}, install a {{plugin}}plugin{{/plugin}} or {{theme}}theme{{/theme}}, or restore your site to the state it was before by selecting a restore point on {{activity}}Jetpack > Activity Log{{/activity}}',
				{
					components: {
						hosting: <a href={ `/hosting-config/${ siteSlug }` }></a>,
						plugin: <a href={ `/plugins/${ siteSlug }` }></a>,
						theme: <a href={ `/themes/${ siteSlug }` }></a>,
						activity: <a href={ `/activity-log/${ siteSlug }` }></a>,
					},
					args: {
						plan: context.planName,
					},
				}
			),
			buttonText: translate( 'Restore to previous state' ),
			buttonLink: '',
			illustration: expiredIllustration,
		};
	} else if ( params.get( 'revivalType' ) === '3' ) {
		taskDetails = {
			heading: 'The Heading',
			body: 'The Body',
			buttonText: 'What should my content be?',
			buttonLink:
				'https://docs.google.com/document/d/125M0PJ7O4qkIxSyg-paC5Xm1DXAd3CyK57utL7YfPs8/edit#heading=h.65gix4k0kof',
			illustration: expiredIllustration,
		};
	}
	return taskDetails;
};
