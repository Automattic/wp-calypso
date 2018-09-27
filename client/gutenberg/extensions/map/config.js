const config = {}

config.name = 'atavist/map';
config.title = 'Map';
config.icon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/><path d="M0 0h24v24H0z" fill="none"/></svg>;
config.category = 'common';
config.keywords = [ 'Map', 'Atavist' ];
config.attributes = {
	map_style: {
		type: 'string',
		default: 'default'
	}
};
config.baseClasses = [
	'atavist-block',
	'atavist-simple-map'
];
config.map_styleOptions = [
	{
		value: 'default',
		label: 'Basic'
	},
	{
		value: 'satellite',
		label: 'Satellite'
	},
	{
		value: 'terrain',
		label: 'Terrain'
	}
];

export default config;
