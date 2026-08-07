import { createRoot } from 'react-dom/client';
import {
	BLACKBOX_DEV_API_KEY_OVERRIDE_OPTIONS,
	getBlackboxDevApiKeyOverride,
	setBlackboxDevApiKeyOverride,
} from 'calypso/lib/blackbox-helper/api-key';

import './style.scss';

const OVERRIDE_LABELS: Record< string, string > = {
	default: 'Default',
	allow: 'Allow',
	block: 'Block',
	challenge: 'Challenge',
};

function BlackboxHelper() {
	const override = getBlackboxDevApiKeyOverride();
	const menuItemClasses = [
		'blackbox-helper__menu-item',
		override === 'default' ? 'is-default' : `is-${ override }`,
	];

	return (
		<>
			<div className={ menuItemClasses.join( ' ' ) }>Blackbox: { OVERRIDE_LABELS[ override ] }</div>
			<div className="blackbox-helper__popover">
				{ BLACKBOX_DEV_API_KEY_OVERRIDE_OPTIONS.map( ( option ) => (
					<label key={ option } className="blackbox-helper__label">
						<input
							type="radio"
							name="blackbox-api-key-override"
							value={ option }
							checked={ override === option }
							onChange={ () => setBlackboxDevApiKeyOverride( option ) }
						/>
						{ OVERRIDE_LABELS[ option ] }
					</label>
				) ) }
				<p className="blackbox-helper__help">Use authorized test accounts for verify to work.</p>
			</div>
		</>
	);
}

export default ( element: HTMLElement ) => createRoot( element ).render( <BlackboxHelper /> );
