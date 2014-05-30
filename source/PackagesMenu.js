/*global enyo, preware */
/*jslint sloppy: true */

enyo.kind({
    name: "preware.PackagesMenu",
    kind: "Scroller",
    horizontal: "hidden",
    classes: "enyo-fill",
    style: "background-image:url('assets/bg.png')",
    touch: true,
    fit: true,
    events: {
        onSelected: ""
    },

    packageFilters: {//filter for all = 0, available (i.e. not installed) = 1, only installed = 2, only updatable = 3
        all: 0,
        available: 1,
        installed: 2,
        updatable: 3
    },
    currentPackageFilter: -1,

    //public components
    published: {
        availablePackages: []
    },


    components: [
        {kind: "ListItem", content: "Package Updates", ontap: "showUpdatablePackages" },
        {kind: "ListItem", content: "Available Packages", ontap: "showAvailableTypeList" },
        {kind: "ListItem", content: "Installed Packages", ontap: "showInstalledPackages" },
        {kind: "ListItem", content: "List of Everything", ontap: "showListOfEverything" }
    ],

    //handlers:
    showUpdatablePackages: function () {
        var i, pkg;
        this.currentPackageFilter = this.packageFilters.updatable;
        this.availablePackages = [];

        for (i = 0; i < preware.PackagesModel.packages.length; i += 1) {
            pkg = preware.PackagesModel.packages[i];
            if (pkg.hasUpdate) {
                if (this.availablePackages.indexOf(pkg) === -1) {
                    this.availablePackages.push(pkg);
                }
            }
        }
        this.sortPackageList();

        this.doSelected({name: "updatable", packagesLength: this.availablePackages.length});
    },
    showAvailableTypeList: function () {
        this.currentPackageFilter = this.packageFilters.available;

        this.doSelected({name: "available", showTypeAndCategoriesPanels: true});
    },
    showInstalledPackages: function () {
        var i, pkg;
        this.currentPackageFilter = this.packageFilters.installed;
        this.availablePackages = [];

        for (i = 0; i < preware.PackagesModel.packages.length; i += 1) {
            pkg = preware.PackagesModel.packages[i];
            if (pkg.isInstalled) {
                if (this.availablePackages.indexOf(pkg) === -1) {
                    this.availablePackages.push(pkg);
                }
            }
        }
        this.sortPackageList();

        this.doSelected({name: "installed", packagesLength: this.availablePackages.length});
    },
    showListOfEverything: function () {
        var i, pkg;
        this.currentPackageFilter = this.packageFilters.all;
        this.availablePackages = [];

        for (i = 0; i < preware.PackagesModel.packages.length; i += 1) {
            pkg = preware.PackagesModel.packages[i];
            if (this.availablePackages.indexOf(pkg) === -1) {
                this.availablePackages.push(pkg);
            }
        }
        this.sortPackageList("date");

        this.doSelected({name: "all", packagesLength: this.availablePackages.length});
    },


    //public function:
    filterByCategoryAndType: function (category, type) {
        var i, pkg;
        this.availablePackages = [];

        for (i = 0; i < preware.PackagesModel.packages.length; i += 1) {
            pkg = preware.PackagesModel.packages[i];

            //first apply package filter:
            if (this.checkPackageStatus(pkg)) {
                //then apply category & type filter
                if (pkg.type === type && pkg.category === category) {
                    if (this.availablePackages.indexOf(pkg) === -1) {
                        this.availablePackages.push(pkg);
                    }
                }
            }
        }
        this.sortPackageList();

        this.doSelected({name: "filtered", showTypeAndCategoriesPanels: true, packagesLength: this.availablePackages.length});
    },
    checkPackageStatus: function (pkg) {
        if (!pkg) {
            return false;
        }
        if ((this.currentPackageFilter === this.packageFilters.available && pkg.isInstalled)
                    || (this.currentPackageFilter === this.packageFilters.installed && !pkg.isInstalled)
                    || (this.currentPackageFilter === this.packageFilters.updatable && !pkg.hasUpdate)) {
            return false; //package does not fit into filter.
        }
        return true; //everything is fine.
    },
    getPackage: function (index) {
        if (index >= 0) {
            return this.availablePackages[index];
        } else {
            return undefined;
        }
    },


    //auxillary package handling stuff:
    sortPackageList: function (field) {
        if (!field) {
            field = "title";
        }
        this.availablePackages.sort(function (a, b) {
            var strA, strB;
            if (a[field] && b[field]) {
                if (typeof a[field] === 'string') {
                    strA = a[field].toLowerCase();
                    strB = b[field].toLowerCase();
                } else {
                    strA = a[field];
                    strB = b[field];
                }
                return ((strA < strB) ? -1 : ((strA > strB) ? 1 : 0));
            }
            return -1;
        });
    }
});
