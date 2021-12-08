import { Button, Card, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import SiteSelector from 'calypso/components/site-selector';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteDomain, getSiteSlug } from 'calypso/state/sites/selectors';
import { SiteData } from 'calypso/state/ui/selectors/get-selected-site';

interface Props {
	stepSectionName: string | null;
	stepName: string;
	goToStep: () => void;
}

const DIFMSitePicker = ( {
	filter,
	onSiteSelect,
}: {
	filter: ( site: SiteData ) => boolean;
	onSiteSelect: ( siteId: string ) => void;
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
	const [ siteId, setSiteId ] = useState< string | null >( null );
	const [ confirmDomain, setConfirmDomain ] = useState( '' );
	const siteDomain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const headerText = translate( 'Choose where you want us to build your site.' );
	const subHeaderText = '';

	useEffect( () => {
		dispatch( saveSignupStep( { stepName: props.stepName } ) );
	}, [ dispatch, props.stepName ] );

	const handleSiteSelect = ( siteId: string ) => {
		setSiteId( siteId );
	};

	const filterSites = ( site: SiteData ) => {
		return site.capabilities.manage_options && ! site.jetpack;
	};

	const onCloseDialog = () => {
		setSiteId( null );
	};

	const onConfirmDelete = () => {
		props.submitSignupStep(
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
		);
		//Skip domains step
		props.submitSignupStep(
			{
				stepName: 'domains',
				wasSkipped: true,
			},
			{
				domainItem: undefined,
				themeItem: undefined,
			}
		);

		props.goToNextStep();
	};

	if ( siteId ) {
		const deleteDisabled = false;
		// typeof confirmDomain !== 'string' ||
		// confirmDomain.toLowerCase().replace( /\s/g, '' ) !== siteDomain;
		const buttons = [
			<Button onClick={ onCloseDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary scary disabled={ deleteDisabled } onClick={ onConfirmDelete }>
				{ translate( 'Delete this site' ) }
			</Button>,
		];

		return (
			<Dialog isVisible={ true } buttons={ buttons } onClose={ onCloseDialog }>
				<h1 className="difm-site-picker__confirm-header">{ translate( 'Confirm delete site' ) }</h1>
				<FormLabel htmlFor="confirmDomainChangeInput" className="difm-site-picker__confirm-label">
					{ translate(
						'Please type in {{warn}}%(siteAddress)s{{/warn}} in the field below to confirm. ' +
							'Your site will then be gone forever.',
						{
							components: {
								warn: <span className="difm-site-picker__target-domain" />,
							},
							args: {
								siteAddress: siteId && siteDomain,
							},
						}
					) }
				</FormLabel>

				<FormTextInput
					autoCapitalize="off"
					className="difm-site-picker__confirm-input"
					onChange={ ( event ) => setConfirmDomain( event.target.value ) }
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
			// headerImageUrl={ intentImageUrl }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={ <DIFMSitePicker filter={ filterSites } onSiteSelect={ handleSiteSelect } /> }
			hideSkip
			{ ...props }
		/>
	);
}
