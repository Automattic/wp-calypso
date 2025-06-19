import { SiteDetails } from '@automattic/data-stores';
import { Hooray, SubTitle, Title } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { resetImport } from 'calypso/state/imports/actions';
import './success-panel.scss';

interface Props {
	importerId?: string;
	site?: SiteDetails;
	onResetImport: () => void;
}

export const SuccessPanel = ( props: Props ) => {
	const translate = useTranslate();
	const { importerId, site } = props;
	const dispatch = useDispatch();

	useEffect( () => {
		if ( site?.ID && importerId ) {
			dispatch( resetImport( site.ID, importerId ) );
		}
	}, [ importerId, dispatch, site?.ID ] );

	return (
		<div className="importer__success-panel">
			<Hooray>
				<div className="import__heading import__heading-center">
					<Title>{ translate( 'Hooray!' ) }</Title>
					<SubTitle>
						{ translate(
							'Your content has been imported successfully to {{strong}}%(title)s{{/strong}}.',
							{
								args: { title: site?.title || '' },
								comment: '%(title)s is the title of the site which user is importing content to.',
								components: {
									strong: <strong />,
								},
							}
						) }
					</SubTitle>

					<div className="importer__success-panel-buttons">
						<Button href={ site?.URL } variant="primary">
							{ translate( 'View your site' ) }
						</Button>
						<Button onClick={ props.onResetImport } variant="tertiary">
							{ translate( 'Import more content' ) }
						</Button>
					</div>
				</div>
			</Hooray>
		</div>
	);
};
