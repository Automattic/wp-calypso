import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'calypso/state';
import { updateThemes } from 'calypso/state/themes/actions/theme-update';
import { getTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function ThemeUpdateAlert( { themeId } ) {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const theme = useSelector( ( state ) => getTheme( state, 'wpcom', themeId ) );

	const dispatch = useDispatch();

	const { themesUpdate, update } = theme;
	const { themesUpdateFailed, themesUpdating, themesUpdated } = themesUpdate;

	const errorOnUpdate = themesUpdateFailed && themesUpdateFailed.indexOf( theme.id ) > -1;
	const isUpdating = themesUpdating && themesUpdating.indexOf( theme.id ) > -1;
	const isUpdated = themesUpdated && themesUpdated.indexOf( theme.id ) > -1;

	if ( ! update && ! isUpdated && ! isUpdating && ! errorOnUpdate ) {
		return null;
	}

	const updateTheme = () => dispatch( updateThemes( [ themeId ], siteId ) );

	if ( errorOnUpdate ) {
		return (
			<div className="theme__update-alert">
				<div className="theme__update-alert-content danger">
					<div>
						<span>
							<Gridicon icon="cross" size={ 18 } />
							{ translate( 'Failed to update Theme.' ) }
						</span>
					</div>
				</div>
			</div>
		);
	}
	if ( isUpdated ) {
		return (
			<div className="theme__update-alert">
				<div className="theme__update-alert-content success">
					<div>
						<span>
							<Gridicon icon="checkmark" size={ 18 } />
							{ translate( 'Theme updated!' ) }
						</span>
					</div>
				</div>
			</div>
		);
	}
	if ( isUpdating ) {
		return (
			<div className="theme__update-alert">
				<div className="theme__update-alert-content info">
					<div>
						<span>
							<Gridicon className="theme__updating-animated" icon="refresh" size={ 18 } />
							{ translate( 'Updating theme.' ) }
						</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="theme__update-alert">
			<div className="theme__update-alert-content warning">
				<div>
					<span>
						<Gridicon icon="refresh" size={ 18 } />
						{ translate( 'New version available.' ) }
					</span>
					<Button onClick={ updateTheme } primary className="theme__button-link" borderless>
						{ translate( 'Update now' ) }
					</Button>
				</div>
			</div>
		</div>
	);
}
