import { Button, Gridicon, FormLabel, SelectDropdown } from '@automattic/components';
import { Title, SubTitle } from '@automattic/onboarding';
import { chevronRight, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import {
	getImportersAsImporterOption,
	type ImporterConfigPriority,
} from 'calypso/lib/importer/importer-config';
import ImporterLogo from 'calypso/my-sites/importer/importer-logo';
import type { ImporterPlatform } from 'calypso/lib/importer/types';
import './style.scss';

export interface ImporterOption {
	value: ImporterPlatform;
	label: string;
	icon?: string;
	priority?: ImporterConfigPriority;
}

interface Props {
	siteSlug: string | null;
	title?: string;
	subTitle?: string;
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
	const fromSite = urlQueryParams.get( 'from' );
	const title = props.title || __( 'Import content from another platform' );
	const subTitle = props.subTitle || __( 'Select the platform where your content lives' );

	// We need to remove the wix importer from the primary importers list.
	const primaryListOptions: ImporterOption[] = getImportersAsImporterOption( 'primary' ).filter(
		( option ) => option.value !== 'wix'
	);
	// We need to remove the icon property for secondary importers to avoid display issues.
	const secondaryListOptions: ImporterOption[] = getImportersAsImporterOption( 'secondary' ).map(
		( { icon, ...rest } ) => rest
	);

	const onImporterSelect = ( platform: ImporterPlatform ): void => {
		const importerUrl = getFinalImporterUrl(
			siteSlug ?? '',
			fromSite ?? '',
			platform,
			backToFlow ?? undefined
		);
		submit?.( { platform, url: importerUrl } );
	};

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
					<Title>{ title }</Title>
					<SubTitle>{ subTitle }</SubTitle>
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
