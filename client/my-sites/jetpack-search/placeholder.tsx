import { ReactElement } from 'react';
import JetpackSearchContent from './content';
import JetpackSearchLogo from './logo';

import './style.scss';

export default function WPComSearchPlaceholder(): ReactElement {
	return (
		<div className="placeholder__search is-placeholder">
			<JetpackSearchContent
				headerText={ 'Placeholder header' }
				bodyText={ 'Placeholder body text' }
				buttonText={ 'Button text' }
				iconComponent={ <JetpackSearchLogo /> }
			/>
		</div>
	);
}
