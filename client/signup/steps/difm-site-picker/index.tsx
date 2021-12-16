import { Button, Card, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import SiteSelector from 'calypso/components/site-selector';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteDomain, getSiteSlug, getSiteTitle } from 'calypso/state/sites/selectors';
import { SiteData } from 'calypso/state/ui/selectors/get-selected-site';

interface Props {
	stepSectionName: string | null;
	stepName: string;
	goToStep: () => void;
	goToNextStep: () => void;
}

const DIFMSitePicker = ( {
	filter,
	onSiteSelect,
}: {
	filter: ( site: SiteData ) => boolean;
	onSiteSelect: ( siteId: number ) => void;
} ) => {
	return (
		<Card className="difm-site-picker__wrapper">
			<SiteSelector filter={ filter } onSiteSelect={ onSiteSelect } />
		</Card>
	);
};

export default function DIFMSitePickerStep( props: Props ): React.ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { goToNextStep } = props;
	const [ siteId, setSiteId ] = useState< number | null >( null );
	const [ confirmDomain, setConfirmDomain ] = useState( '' );
	const siteDomain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const siteTitle = useSelector( ( state ) => getSiteTitle( state, siteId ) );
	const headerText = translate( 'Choose where you want us to build your site.' );
	const subHeaderText = translate( 'Some unsupported sites may be hidden.' );

	useEffect( () => {
		dispatch( saveSignupStep( { stepName: props.stepName } ) );
	}, [ dispatch, props.stepName ] );

	const handleSiteSelect = ( siteId: number ) => {
		setSiteId( siteId );
	};

	const filterSites = ( site: SiteData ) => {
		return (
			site.capabilities?.manage_options &&
			! site.jetpack &&
			! site.options?.is_wpforteams_site &&
			! site.options?.is_difm_lite_in_progress
		);
	};

	const onCloseDialog = () => {
		setSiteId( null );
	};

	const onConfirmDelete = () => {
		dispatch(
			submitSignupStep(
				{
					stepName: props.stepName,
					stepSectionName: props.stepSectionName,
					siteId,
					siteSlug,
				},
				{
					siteId,
					siteSlug,
				}
			)
		);
		//Skip domains step
		dispatch(
			submitSignupStep(
				{
					stepName: 'domains',
					wasSkipped: true,
				},
				{
					domainItem: undefined,
					themeItem: undefined,
				}
			)
		);

		goToNextStep();
	};

	if ( siteId ) {
		const deleteDisabled =
			typeof confirmDomain !== 'string' ||
			confirmDomain.toLowerCase().replace( /\s/g, '' ) !== siteDomain;
		const buttons = [
			<Button onClick={ onCloseDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary scary disabled={ deleteDisabled } onClick={ onConfirmDelete }>
				{ translate( 'Delete site content' ) }
			</Button>,
		];

		return (
			<Dialog isVisible={ true } buttons={ buttons } onClose={ onCloseDialog }>
				<h1>{ translate( 'Site Reset Confirmation' ) }</h1>
				<p>{ translate( 'After completing your purchase:' ) }</p>
				<ul>
					<li>
						{ translate(
							'The current content of your website {{strong}}%(siteTitle)s{{/strong}} (%(siteAddress)s) will be deleted, so we can start your website build on an empty site. ' +
								'This includes pages, posts, media, and comments.',
							{
								components: {
									strong: <strong />,
								},
								args: {
									siteTitle,
									siteAddress: siteDomain,
								},
							}
						) }
					</li>
					<li>
						{ translate(
							'Any WordPress.com subscriptions on your site such as custom domains and emails will not be affected.'
						) }
					</li>
					<li>
						{ translate(
							'Your site will be inaccessible in {{i}}Coming Soon{{/i}} mode while we build your new site.',
							{
								components: {
									i: <i />,
								},
							}
						) }
					</li>
				</ul>
				<p>
					{ translate(
						'If you don’t want your site content to be deleted, we can instead create a new site on your account for the website build. ' +
							'You can then transfer the existing content to the new site once it’s complete. ' +
							'Click {{a}}here{{/a}} to go back and choose "New Site".',
						{
							components: {
								a: <a href="/start/do-it-for-me" />,
							},
						}
					) }
				</p>
				<FormLabel htmlFor="confirmDomainChangeInput">
					{ translate(
						'Please type in {{warn}}%(siteAddress)s{{/warn}} in the field below to confirm. ' +
							"Your site's content will then be gone forever.",
						{
							components: {
								warn: <span />,
							},
							args: {
								siteAddress: siteId && siteDomain,
							},
						}
					) }
				</FormLabel>

				<FormTextInput
					autoCapitalize="off"
					onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
						setConfirmDomain( event.target.value )
					}
					value={ confirmDomain }
					aria-required="true"
					id="confirmDomainChangeInput"
				/>
			</Dialog>
		);
	}

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={ <DIFMSitePicker filter={ filterSites } onSiteSelect={ handleSiteSelect } /> }
			hideSkip
			{ ...props }
		/>
	);
}
