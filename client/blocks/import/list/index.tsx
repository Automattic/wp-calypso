import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Gridicon, FormLabel, SelectDropdown } from '@automattic/components';
import { Title, SubTitle } from '@automattic/onboarding';
import { chevronRight, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import ImporterLogo from 'calypso/my-sites/importer/importer-logo';
import type { ImporterPlatform } from '../types';
import './style.scss';

const trackEventName = 'calypso_signup_step_start';
const trackEventParams = {
	flow: 'importer',
	step: 'list',
};

interface ImporterOption {
	value: ImporterPlatform;
	label: string;
	icon?: string;
}

interface Props {
	siteSlug: string | null;
	submit?: ( dependencies: Record< string, unknown > ) => void;
	getFinalImporterUrl: (
		siteSlug: string,
		fromSite: string,
		platform: ImporterPlatform,
		backToFlow?: string
	) => string;
	onNavBack?: () => void;
}

export default function ListStep( props: Props ) {
	const { __ } = useI18n();
	const urlQueryParams = useQuery();
	const { siteSlug, submit, getFinalImporterUrl, onNavBack } = props;
	const backToFlow = urlQueryParams.get( 'backToFlow' );

	const primaryListOptions: ImporterOption[] = [
		{ value: 'wordpress', label: 'WordPress', icon: 'wordpress' },
		{ value: 'blogger', label: 'Blogger', icon: 'blogger-alt' },
		{ value: 'medium', label: 'Medium', icon: 'medium' },
		{ value: 'squarespace', label: 'Squarespace', icon: 'squarespace' },
	];

	const secondaryListOptions: ImporterOption[] = [
		{ value: 'blogroll', label: 'Blogroll' },
		{ value: 'ghost', label: 'Ghost' },
		{ value: 'livejournal', label: 'LiveJournal' },
		{ value: 'movabletype', label: 'Movable Type & TypePad' },
		{ value: 'substack', label: 'Substack' },
		{ value: 'tumblr', label: 'Tumblr' },
		{ value: 'xanga', label: 'Xanga' },
	];

	const onImporterSelect = ( platform: ImporterPlatform ): void => {
		const importerUrl = getFinalImporterUrl(
			siteSlug ?? '',
			'',
			platform,
			backToFlow ?? undefined
		);
		submit?.( { platform, url: importerUrl } );
	};

	const recordImportList = () => {
		recordTracksEvent( trackEventName, trackEventParams );
	};

	useEffect( recordImportList, [] );

	return (
		<>
			{ onNavBack && (
				<div className="import__navigation">
					<Button onClick={ onNavBack } borderless type="button">
						<Gridicon icon="chevron-left" size={ 18 } />
						Back
					</Button>
				</div>
			) }
			<div className="list__wrapper">
				<div className="import__heading import__heading-center">
					<Title>{ __( 'Import content from another platform' ) }</Title>
					<SubTitle>{ __( 'Select the platform where your content lives' ) }</SubTitle>
				</div>
				<div className="list__importers list__importers-primary">
					{ primaryListOptions.map( ( x ) => (
						<Button
							key={ x.value }
							className="list__importers-item-card"
							onClick={ () => onImporterSelect( x.value ) }
						>
							<ImporterLogo icon={ x.icon } />
							<h2>{ x.label }</h2>
							<Icon icon={ chevronRight } />
						</Button>
					) ) }
				</div>

				<div className="list__importers list__importers-secondary">
					<FormLabel>{ __( 'Other platforms' ) }</FormLabel>
					<SelectDropdown
						selectedText={ __( 'Select other platform' ) }
						options={ secondaryListOptions }
						onSelect={ ( x: ImporterOption ) => onImporterSelect( x.value ) }
					/>
				</div>
			</div>
		</>
	);
}
