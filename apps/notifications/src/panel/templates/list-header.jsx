import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import actions from '../state/actions';
import Gridicon from './gridicons';
import ShortcutsPopover from './shortcuts-popover';

export const ListHeader = ( { isFirst, title, viewSettings } ) => {
	const translate = useTranslate();

	return (
		<li className="wpnc__time-group-wrap">
			<div className="wpnc__time-group-title">
				<Gridicon icon="time" size={ 18 } />
				{ title }
				{ isFirst && (
					<>
						<span
							className="wpnc__settings"
							onClick={ viewSettings }
							onKeyDown={ ( e ) => {
								if ( e.key === 'Enter' ) {
									viewSettings();
								}
							} }
							aria-label={ translate( 'Open notification settings' ) }
							role="button"
							tabIndex="0"
						>
							<Gridicon icon="cog" size={ 18 } />
						</span>
						<ShortcutsPopover />
					</>
				) }
			</div>
		</li>
	);
};

const mapDispatchToProps = {
	viewSettings: actions.ui.viewSettings,
};

export default connect( null, mapDispatchToProps )( ListHeader );
