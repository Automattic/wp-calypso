import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, FormLabel, SelectDropdown } from '@automattic/components';
import { Title, SubTitle } from '@automattic/onboarding';
import { chevronRight, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect } from 'react';
import ImporterLogo from 'calypso/my-sites/importer/importer-logo';
import { useDispatch } from 'calypso/state';
import { urlDataUpdate } from 'calypso/state/imports/url-analyzer/actions';
import type { GoToStep, ImporterPlatform } from '../types';
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
	goToStep: GoToStep;
}

export default function ListStep( props: Props ) {
	const dispatch = useDispatch();
	const { __ } = useI18n();
	const { goToStep } = props;

	const primaryListOptions: ImporterOption[] = [
		{ value: 'wordpress', label: 'WordPress', icon: 'wordpress' },
		{ value: 'blogger', label: 'Blogger', icon: 'blogger-alt' },
		{ value: 'medium', label: 'Medium', icon: 'medium' },
		{ value: 'squarespace', label: 'Squarespace', icon: 'squarespace' },
	];

	const secondaryListOptions: ImporterOption[] = [
		{ value: 'blogroll', label: 'Blogroll' },
		{ value: 'ghost', label: 'Ghost' },
		{ value: 'tumblr', label: 'Tumblr' },
		{ value: 'livejournal', label: 'LiveJournal' },
		{ value: 'movabletype', label: 'Movable Type & TypePad' },
		{ value: 'xanga', label: 'Xanga' },
	];

	const onImporterSelect = ( platform: ImporterPlatform ): void => {
		dispatch(
			urlDataUpdate( {
				url: '',
				platform,
				meta: {
					favicon: null,
					title: null,
				},
			} )
		);
		goToStep( `ready` );
	};

	const recordImportList = () => {
		recordTracksEvent( trackEventName, trackEventParams );
	};

	/**
	 ↓ Effects
	 */
	useEffect( recordImportList, [] );

	return (
		<>
			<div className="import-layout list__wrapper">
				<div className="import__heading import__heading-center">
					<Title>{ __( 'Import content from another platform' ) }</Title>
					<SubTitle>{ __( 'Select the platform where your content lives' ) }</SubTitle>
				</div>
				<div className="list__importers list__importers-primary">
					{ primaryListOptions.map( ( x ) => (
						<Button
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
					></SelectDropdown>
				</div>
			</div>
		</>
	);
}
