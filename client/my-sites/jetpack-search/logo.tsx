import { ReactElement } from 'react';
import JetpackSearchSVG from 'calypso/assets/images/illustrations/jetpack-search.svg';

export default function JetpackSearchLogo(): ReactElement {
	return (
		<div className="jetpack-search__logo">
			<img src={ JetpackSearchSVG } alt="Search logo" />
		</div>
	);
}
