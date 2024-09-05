sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
],
    function (Controller, JSONModel, MessageToast, MessageBox, Fragment) {
        "use strict";

        return Controller.extend("com.app.testdeploy.controller.View1", {
            onInit: function () {
                this.localModel = new JSONModel();
                this.getView().setModel(this.localModel, "localModel");

                const newReserve = new JSONModel({
                    Vehiclenumber: "",
                    Vendorname: "",
                    Drivername: "",
                    Drivermobile: ""
                });
                this.getView().setModel(newReserve, "newReserve");

            },
            onUpload: async function (e) {
                debugger
                await this._import(e.getParameter("files") && e.getParameter("files")[0]);
                if (!this.oFragment) {
                    this.oFragment = await Fragment.load({
                        id: this.getView().getId(),
                        name: "com.app.testdeploy.fragments.excelData",
                        controller: this
                    });
                    this.getView().addDependent(this.oFragment);
                }

                this.oFragment.open();
            },

            _import: function (file) {
                var that = this;
                var excelData = {};
                if (file && window.FileReader) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var data = new Uint8Array(e.target.result);
                        var workbook = XLSX.read(data, {
                            type: 'array'
                        });
                        workbook.SheetNames.forEach(function (sheetName) {
                            // Here is your object for every sheet in workbook
                            excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                        });
                        // Setting the data to the local model
                        that.localModel.setData({
                            items: excelData
                        });
                        that.localModel.refresh(true);
                    };
                    reader.onerror = function (ex) {
                        console.log(ex);
                    };
                    reader.readAsArrayBuffer(file);
                }
            },
            onClosePress: function () {
                if (this.oFragment) {
                    this.oFragment.close();
                }
            },
            onClear: function () {
                this.localModel.setData()
                this.byId("FileUploaderId").setValue()
            },
            onCreatePress: function () {


                var oJSONModel = this.getView().getModel("newReserve");
                const oModel = this.getView().getModel(),
                    oData = oJSONModel.getData(),
                    oUserView = this.getView()
                // oBinding = oModel.bindList("/ZPARK_RESERVE_ESUBSet")
                var oPayload = {
                    Vehiclenumber: oData.Vehiclenumber,
                    Vendorname: oData.Vendorname,
                    Drivername: oData.Drivername,
                    Drivermobile: oData.Drivermobile
                }

                var Flag = true;
                if (!oData.Drivername || oData.Drivername.length < 3) {
                    oUserView.byId("_IDGen__dfgdInput1").setValueState("Error");
                    oUserView.byId("_IDGen__dfgdInput1").setValueStateText("Name must contain 3 characters atleast");
                    Flag = false;
                } else {
                    oUserView.byId("_IDGen__dfgdInput1").setValueState("None");
                }
                if (!oData.Drivermobile || oData.Drivermobile.length !== 10 || !/^\d+$/.test(oData.Drivermobile)) {
                    oUserView.byId("_IDGexgrsdfgnIn__put2").setValueState("Error");
                    oUserView.byId("_IDGexgrsdfgnIn__put2").setValueStateText("Mobile number must be a 10-digit numeric value");

                    Flag = false;
                } else {
                    oUserView.byId("_IDGexgrsdfgnIn__put2").setValueState("None");
                }
                if (!oData.Vehiclenumber || !/^[A-Za-z]{2}\d{2}[A-Za-z]{2}\d{4}$/.test(oData.Vehiclenumber)) {
                    oUserView.byId("afidasgredhmeI__nput").setValueState("Error");
                    oUserView.byId("afidasgredhmeI__nput").setValueStateText("Vehicle number should follow this pattern AP12BG1234");

                    Flag = false;
                } else {
                    oUserView.byId("afidasgredhmeI__nput").setValueState("None");
                }
                if (!oData.Vendorname || oData.Vendorname === "Select") {
                    oUserView.byId("idss__n0075put").setValueState("Error");
                    oUserView.byId("idss__n0075put").setValueStateText("Name must contain 3 characters atleast");

                    Flag = false;
                } else {
                    oUserView.byId("idss__n0075put").setValueState("None");
                }

                if (!Flag) {
                    MessageToast.show("Please enter correct data");
                    return; // Prevent further execution

                }

                oModel.create("/ZPARK_RESERVE_ESUBSet", oPayload, {
                    success: function (oData, oResponse) {
                        MessageToast.show("Created")
                    },
                    error: function (error) {
                        MessageToast.show("Error" + error.message)
                    }
                })

            },
            onDeletePress: function () {
                const oSelected = this.byId("_IDGenTable1").getSelectedItem().getBindingContext().getPath(),
                    oModel = this.getView().getModel()
                oModel.remove(oSelected, {
                    success: function (oData, oResp) {
                        MessageToast.show("Deleted")
                    },
                    error: function (error) {
                        MessageToast.show("Error" + error.message)
                    }
                })

            },
            onEditPress: function () {

                var oTable = this.byId("_IDGenTable1");
                var oModel = this.getView().getModel()
                var oSelectedItem = oTable.getSelectedItem()
                if (oSelectedItem) {
                    var aCells = oSelectedItem.getCells()
                    aCells.forEach((cells) => {
                        const aItems = cells.getItems()
                        aItems[0].setVisible(false)
                        aItems[1].setVisible(true)
                        aCells[0].getItems()[0].setVisible(true)
                        aCells[0].getItems()[1].setVisible(false)
                    })
                    this.byId("idBtnEdit").setVisible(false);
                    this.byId("idBtnCancel").setVisible(true);
                    this.byId("idUpdate").setVisible(true);
                    this.byId("idDelete").setVisible(false);
                } else {
                    sap.m.MessageBox.information("Please select a record")
                }
            },
            onCancelPress: function () {

                var oTable = this.byId("_IDGenTable1");
                var oModel = this.getView().getModel()
                var oSelectedItem = oTable.getSelectedItem()
                var aCells = oSelectedItem.getCells()
                aCells.forEach((cells) => {
                    const aItems = cells.getItems()
                    aItems[0].setVisible(true)
                    aItems[1].setVisible(false)
                })
                this.byId("idBtnEdit").setVisible(true);
                this.byId("idBtnCancel").setVisible(false);
                this.byId("idUpdate").setVisible(false);
                this.byId("idDelete").setVisible(true);
                oModel.refresh(true)

            },
            onUpdatePress: function () {
                var oTable = this.byId("_IDGenTable1");
                var oModel = this.getView().getModel()
                var oSelectedItem = oTable.getSelectedItem()
                var oSelectedPath = oTable.getSelectedItem().getBindingContext().getPath()
                var aCells = oSelectedItem.getCells(),
                    oUserView = this.getView()
                const aNewData = []
                aCells.forEach((cells) => {
                    const aItems = cells.getItems()
                    const newData = aItems[1].getValue()
                    aNewData.push(newData)
                })
                // console.log(aNewData)
                const oPayload = {
                    Vendorname: aNewData[1],
                    Drivername: aNewData[2],
                    Drivermobile: aNewData[3]
                }
                var Flag = true;
                if (!aNewData[1] || aNewData[1].length < 3) {
                    oSelectedItem.getCells()[1].getItems()[1].setValueState("Error");
                    oSelectedItem.getCells()[1].getItems()[1].setValueStateText("Name must contain 3 characters atleast");
                    Flag = false;
                } else {
                    oSelectedItem.getCells()[1].getItems()[1].setValueState("None");
                }
                if (!aNewData[2] || aNewData[2].length < 3) {
                    oSelectedItem.getCells()[2].getItems()[1].setValueState("Error");
                    oSelectedItem.getCells()[2].getItems()[1].setValueStateText("Name must contain 3 characters atleast");

                    Flag = false;
                } else {
                    oSelectedItem.getCells()[2].getItems()[1].setValueState("None");
                }
                if (!aNewData[3] || aNewData[3].length !== 10 || !/^\d+$/.test(aNewData[3])) {
                    oSelectedItem.getCells()[3].getItems()[1].setValueState("Error");
                    oSelectedItem.getCells()[3].getItems()[1].setValueStateText("Mobile number must be a 10-digit numeric value");

                    Flag = false;
                } else {
                    oSelectedItem.getCells()[3].getItems()[1].setValueState("None");
                }
                if (!Flag) {
                    MessageToast.show("Please enter correct data");
                    return; // Prevent further execution

                }

                oModel.update(oSelectedPath, oPayload, {
                    success: function (oData, oResp) {
                        MessageToast.show("Record updated successfully")
                        var aCells = oSelectedItem.getCells()
                        aCells.forEach((cells) => {
                            const aItems = cells.getItems()
                            aItems[0].setVisible(true)
                            aItems[1].setVisible(false)
                        })
                    },
                    error: function (error) {
                        MessageToast.show("Error while Updating " + error.message)

                    }
                })

            },
            // onCreateBatchRequests: function () {
            //     debugger
            //     var aPayloads = this.preparePayloads();
            //     var oODataModel = this.getView().getModel("localModel"),
            //         oModel = this.getView().getModel()

            //     // Create an array to hold the batch operations
            //     var aBatchOperations = aPayloads.map(function (oPayload) {
            //         return oModel.createBatchOperation("/ZPARK_RESERVE_ESUBSet", "POST", oPayload);
            //     });

            //     // Add the batch operations to the model
            //     oODataModel.addBatchChangeOperations(aBatchOperations);

            //     // Submit the batch request
            //     oODataModel.submitBatch(function (oData) {
            //         sap.m.MessageToast.show("Batch request completed successfully.");
            //         console.log("Batch request completed successfully", oData);
            //     }, function (oError) {
            //         sap.m.MessageToast.show("Error in batch request.");
            //         console.log("Error in batch request", oError);
            //     });
            // },
            // preparePayloads: function () {
            //     var oModel = this.getView().getModel("localModel");
            //     var aData = oModel.getData();

            //     var aPayloads = aData.items.map(function (item) {
            //         return {
            //             Vehiclenumber: item.Vehiclenumber,
            //             Vendorname: item.Vendorname,
            //             Drivername: item.Drivername,
            //             Drivermobile: item.Drivermobile
            //         };
            //     });

            //     return aPayloads;
            // },


            // onBatchSave: function() {
            //     debugger
            //     var that = this;
            //     var addedProdCodeModel = that.getView().getModel("localModel").getData();
            //     var batchChanges = [];
            //     var url = that.getOwnerComponent().getModel().sServiceUrl;
            //     var oDataModel = new sap.ui.model.odata.ODataModel(url);
            //     oDataModel.setUseBatch(true);
            //     var uPath = "/ZPARK_RESERVE_ESUBSet";
            //     for (var i = 0; i < addedProdCodeModel.items.length; i++) {
            //     var addRow = addedProdCodeModel.items[i];
            //     delete addRow.visible;
            //     batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addRow));
            //     }
            //     oDataModel.addBatchChangeOperations(batchChanges);
            //     oDataModel.submitBatch(function(oData, oResponse) {
            //     // Success callback function
            //     if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
            //     sap.m.MessageBox.success("Records Created Successfully");
            //     that.tableRead();
            //     }
            //     // Handle the response data
            //     }, function(oError) {
            //     // Error callback function
            //     sap.m.MessageBox.success("failed");
            //     // Handle the error
            //     });
            //     this.oFragment.close();
            //     }


            onBatchSave: function () {
                // working
                var that = this;
                var addedProdCodeModel = that.getView().getModel("localModel").getData();
                var batchChanges = [];
                var url = that.getOwnerComponent().getModel().sServiceUrl;
                var oDataModel = this.getView().getModel();


                var batchGroupId = "batchCreateGroup";

                // Collect all create operations into the batchChanges array
                addedProdCodeModel.items.forEach(item => {
                    // Create individual batch request
                    oDataModel.create("/ZPARK_RESERVE_ESUBSet", item, {
                        method: "POST",
                        groupId: batchGroupId // Specify the batch group ID here
                    });
                });

                // Submit all changes in the batch
                oDataModel.submitChanges({
                    groupId: batchGroupId,
                    success: function (data, response) {
                        MessageBox.show("Batch create operation successful.");
                    },
                    error: function (e) {
                        // Parse the error response and show a meaningful message
                        var errorMessage = e.message || "An error occurred";
                        MessageBox.show("Error: " + errorMessage);
                    }
                });
                if (this.oFragment) {
                    this.oFragment.close();
                }
            },
        });
    });
