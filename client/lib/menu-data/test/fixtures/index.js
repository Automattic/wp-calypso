module.exports = {
    menusFlat: {
        menus: [
            {
                id: 1,
                name: 'Menu 1',
                items: [
                    { id: 1, name: 'Home' },
                    {
                        id: 3,
                        name: 'Products',
                        items: [
                            {
                                id: 5,
                                name: 'Socks',
                                items: [
                                    { id: 6, name: 'Stripy socks' },
                                    {
                                        id: 7,
                                        name: '80s socks',
                                        items: [{ id: 9, name: 'Space invader designs' }],
                                    },
                                ],
                            },
                            { id: 4, name: 'Slippers' },
                        ],
                    },
                    {
                        id: 2,
                        name: 'About us',
                        items: [{ id: 8, name: 'Location' }],
                    },
                ],
                locations: ['primary'],
            },
            {
                id: 2,
                name: 'Menu 2 &amp;c.',
                items: [
                    { id: 1, name: 'Item 21 &amp; counting' },
                    { id: 2, name: 'Item 22' },
                    { id: 3, name: 'Item 23' },
                ],
                locations: null,
            },
            {
                id: 3,
                name: 'Menu 3',
                description: 'The third menu is dull &amp; boring',
                items: [
                    { id: 1, name: 'Item 31' },
                    { id: 2, name: 'Item 32' },
                    { id: 3, name: 'Item 33' },
                ],
                locations: ['secondary'],
            },
        ],
        locations: [
            { name: 'primary', description: 'Top &amp; Primary Menu' },
            { name: 'secondary', description: 'Secondary menu in left sidebar' },
            { name: 'social&amp;lite', description: 'Social Menu' },
        ],
    },
};
