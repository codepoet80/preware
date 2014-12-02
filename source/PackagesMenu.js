/*global enyo, preware */
/*jslint sloppy: true */

//TODO: extract the package filtering logic into a "PackageFilter" singleton.
// => best would be to use bindings to fill the repeaters
// => connect this to the cookie-pref about installed <=> available apps, too.

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
        availablePackages: [],
        availableTypes: [],
        availableCategories: [],
        listOfEverything: []
    },
    bindings: [
        {from: ".listOfEverything", to: ".$.listOfEverythingItem.count", transform: function (list) { return list.length;}}
    ],


    components: [
        {kind: "ListItem", content: "Package Updates", ontap: "showUpdatablePackages" },
        {kind: "ListItem", content: "Available Packages", ontap: "showAvailableTypeList" },
        {kind: "ListItem", content: "Installed Packages", ontap: "showInstalledPackages" },
        {name: "listOfEverythingItem", kind: "ListItem", content: $L("List of Everything"), ontap: "showListOfEverything" }
    ],

    //handlers:
    showUpdatablePackages: function () {
        var i, pkg;
        this.currentPackageFilter = this.packageFilters.updatable;
        this.availablePackages = [];

        for (i = 0; i < preware.PackagesModel.packages.length; i += 1) {
            pkg = preware.PackagesModel.packages[i];
            if (this.checkPackageStatus(pkg)) {
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
        this.availableTypes = [];

        var i, pkg;
        for (i = 0; i < preware.PackagesModel.packages.length; i += 1) {
            pkg = preware.PackagesModel.packages[i];
            if (this.checkPackageStatus(pkg)) {
                if (this.availableTypes.indexOf(pkg.type) === -1) {
                    this.availableTypes.push(pkg.type);
                }
            }
        }
        this.availableTypes.sort();

        this.doSelected({name: "available", showTypeAndCategoriesPanels: true, typesLength: this.availableTypes.length});
    },
    showInstalledPackages: function () {
        var i, pkg;
        this.currentPackageFilter = this.packageFilters.installed;
        this.availablePackages = [];

        for (i = 0; i < preware.PackagesModel.packages.length; i += 1) {
            pkg = preware.PackagesModel.packages[i];
            if (this.checkPackageStatus(pkg)) {
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
    filterCategories: function (type) {
        this.availableCategories = [];

        var i, pkg;
        for (i = 0; i < preware.PackagesModel.packages.length; i += 1) {
            pkg = preware.PackagesModel.packages[i];
            if (this.checkPackageStatus(pkg) && pkg.type === type) {
                if (this.availableCategories.indexOf(pkg.category) === -1) {
                    this.availableCategories.push(pkg.category);
                }
            }
        }
        this.availableCategories.sort();

        this.doSelected({name: "filtered", showTypeAndCategoriesPanels: true, categoriesLength: this.availableCategories.length});
    },
    checkPackageStatus: function (pkg) {
        if (!pkg) {
            return false;
        }
        if (this.currentPackageFilter === this.packageFilters.updatable) {
            return pkg.hasUpdate;
        }
        if (this.currentPackageFilter === this.packageFilters.installed) {
            return pkg.isInstalled;
        }

        if (this.currentPackageFilter === this.packageFilters.available) {
            if (preware.PrefCookie.get().listInstalled) { //include installed packages.
                return true;
            } else {
                return !pkg.isInstalled; //return only not installed packages.
            }
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
