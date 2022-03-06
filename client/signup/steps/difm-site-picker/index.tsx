import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SiteSelector from 'calypso/components/site-selector';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { SiteData } from 'calypso/state/ui/selectors/get-selected-site';
import SiteDeleteConfirmationDialog from './site-delete-confirmation-dialog';
import './styles.scss';

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
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const headerText = translate( 'Choose where you want us to build your site.' );
	const subHeaderText = translate( 'Some unsupported sites may be hidden.' );

	useEffect( () => {
		dispatch( saveSignupStep( { stepName: props.stepName } ) );
	}, [ dispatch, props.stepName ] );

	const handleSiteSelect = ( siteId: number ) => {
		setSiteId( siteId );
	};

	const filterSites = ( site: SiteData ) => {
		return !! (
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

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={
				<>
					<DIFMSitePicker filter={ filterSites } onSiteSelect={ handleSiteSelect } />
					{ siteId && (
						<SiteDeleteConfirmationDialog
							onClose={ onCloseDialog }
							onConfirm={ onConfirmDelete }
							siteId={ siteId }
						/>
					) }
				</>
			}
			hideSkip
			{ ...props }
		/>
	);
}
