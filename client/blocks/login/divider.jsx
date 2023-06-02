import './divider.scss';

export default function Divider( { children } ) {
	return (
		<div className="login__divider">
			<span>{ children }</span>
		</div>
	);
}
