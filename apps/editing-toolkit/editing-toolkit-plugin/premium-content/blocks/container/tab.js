/**
 * @typedef { import('react').ReactNode } ReactNode
 * @typedef {object} Tab
 * @property { string } id
 * @property { (ReactNode | string) } label
 * @property { string } className
 * @typedef {object} Props
 * @property { Tab } tab
 * @property { Tab } selectedTab
 * @property { (tab: Tab) => void } onSelected
 * @param { Props } props the props
 */
export default function Tab( props ) {
	const { className, tab, label, selectedTab, onSelected } = props;

	const classNames = ( tab.id === selectedTab.id ? [ 'is-pressed', 'is-active' ] : [] ).concat( [
		className,
		'components-button',
		'components-tab-button',
	] );

	return (
		<button type="button" onClick={ () => onSelected( tab ) } className={ classNames.join( ' ' ) }>
			{ label }
		</button>
	);
}
