package org.squaddeep.interledger.model.accounts;

import java.net.URL;

public class Wallet {
    private URL walletAddress;
    private String ID;
    private String publicName;
    private int assetScale;
    private String assetCode;
    private String resourceServer;

    public URL getWalletAddress() {
        return walletAddress;
    }

    public void setWalletAddress(URL walletAddress) {
        this.walletAddress = walletAddress;
    }

    public String getID() {
        return ID;
    }

    public void setID(String ID) {
        this.ID = ID;
    }

    public String getPublicName() {
        return publicName;
    }

    public void setPublicName(String publicName) {
        this.publicName = publicName;
    }

    public int getAssetScale() {
        return assetScale;
    }

    public void setAssetScale(int assetScale) {
        this.assetScale = assetScale;
    }

    public String getAssetCode() {
        return assetCode;
    }

    public void setAssetCode(String assetCode) {
        this.assetCode = assetCode;
    }

    public String getResourceServer() {
        return resourceServer;
    }

    public void setResourceServer(String resourceServer) {
        this.resourceServer = resourceServer;
    }
}
