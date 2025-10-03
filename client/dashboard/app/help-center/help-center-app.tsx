import HelpCenter from '@automattic/help-center';
import './help-center-app.scss';

/**
 * This additional wrapper around the HelpCenter component gives us a place to
 * async load the stylesheet.
 */
export default function HelpCenterApp( props: React.ComponentProps< typeof HelpCenter > ) {
	return <HelpCenter { ...props } />;
}
