import { WordPressLogo } from '@automattic/components';
import { createRoot } from 'react-dom/client';

function Dashboard() {
	return (
		<div>
			<WordPressLogo />
			<span>Hello Dashboard!</span>
		</div>
	);
}

const root = createRoot( document.getElementById( 'wpcom' ) );
root.render( <Dashboard /> );
