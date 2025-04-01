import { createRoot } from 'react-dom/client';

function Dashboard() {
	return 'Hello Dashboard!';
}

const root = createRoot( document.getElementById( 'wpcom' ) );
root.render( <Dashboard /> );
