import { WordPressWordmark } from '@automattic/components';

const PlaceholderHeader = ( { logoColor = '#fff' } ) => {
	return (
		<div
			style={ {
				display: 'flex',
				justifyContent: 'space-between',
				padding: '0 20px',
				alignItems: 'center',
				fontWeight: 600,
			} }
			className="wp-block-happy-blocks-universal-header"
		>
			<ul
				style={ {
					display: 'flex',
					listStyle: 'none',
					padding: 0,
					gap: 20,
					alignItems: 'center',
				} }
			>
				<li>
					<WordPressWordmark color={ logoColor } size={ { width: 170, height: 36 } } />
				</li>
				<li>Products ▾</li>
				<li>Features ▾</li>
				<li>Resources ▾</li>
				<li>Plans & Pricing</li>
			</ul>
			<p
				style={ {
					backgroundColor: '#0675c4',
					borderRadius: 4,
					color: '#fff',
					padding: '10px 24px 10px 24px',
					fontWeight: 600,
				} }
			>
				Get Started
			</p>
		</div>
	);
};

export default PlaceholderHeader;
