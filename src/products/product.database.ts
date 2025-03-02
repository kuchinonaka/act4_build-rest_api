import { Product, UnitProduct, Products } from "./product.interface";
import { v4 as random } from "uuid";
import fs from "fs";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

// Calculate the correct path for products.json
const PRODUCTS_FILE_PATH = path.resolve(__dirname, "../../products.json");

// Load products from the file or initialize an empty object
let products: Products = loadProducts();

// Function to load products from the file
function loadProducts(): Products {
    try {
        console.log("Loading from:", PRODUCTS_FILE_PATH);
        if (!fs.existsSync(PRODUCTS_FILE_PATH)) {
            console.log("File doesn't exist yet - creating empty products");
            // Create the file with an empty object
            fs.writeFileSync(PRODUCTS_FILE_PATH, JSON.stringify({}), "utf-8");
            return {};
        }
        const data = fs.readFileSync(PRODUCTS_FILE_PATH, "utf-8");
        if (!data) {
            return {};
        }
        const parsedData = JSON.parse(data);
        // Ensure parsedData is an object, not an array
        if (Array.isArray(parsedData)) {
            console.log("Warning: products.json contains an array. Converting to object.");
            return {};
        }
        return parsedData;
    } catch (error) {
        console.log(`Error loading products: ${error}`);
        return {};
    }
}

// Function to save products to the file
function saveProducts() {
    try {
        console.log("Saving to:", PRODUCTS_FILE_PATH);
        console.log("Data being saved:", JSON.stringify(products, null, 2));
        fs.writeFileSync(PRODUCTS_FILE_PATH, JSON.stringify(products, null, 2), "utf-8");
        console.log("Product saved successfully!");
    } catch (error) {
        console.log(`Error saving products: ${error}`);
        console.log("Error details:", error);
    }
}

// Function to find all products
export const findAll = async (): Promise<UnitProduct[]> => {
    return Object.values(products);
};

// Function to find a single product by ID
export const findOne = async (id: string): Promise<UnitProduct> => {
    return products[id];
};

// Function to create a new product
export const create = async (productData: UnitProduct): Promise<UnitProduct | null> => {
    let id = random();

    // Ensure the ID is unique
    let check_product = await findOne(id);
    while (check_product) {
        id = random();
        check_product = await findOne(id);
    }

    // Create the new product
    const product: UnitProduct = {
        id: id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        quantity: productData.quantity
    };

    // Ensure products is an object
    if (Array.isArray(products)) {
        console.log("Warning: products is an array. Converting to object.");
        products = {};
    }

    // Add the new product to the products object
    products[id] = product;

    console.log("Products object before saving:", JSON.stringify(products));
    saveProducts();

    // Verify the file was saved correctly
    try {
        const savedData = fs.readFileSync(PRODUCTS_FILE_PATH, "utf-8");
        console.log("File contents after save:", savedData);
    } catch (readError) {
        console.log("Error reading file after save:", readError);
    }

    return product;
};

// Function to update an existing product
export const update = async (id: string, updateValues: Product): Promise<UnitProduct | null> => {
    const productExists = await findOne(id);

    if (!productExists) {
        return null;
    }

    // Update the product
    products[id] = {
        ...productExists,
        ...updateValues
    };

    saveProducts();

    return products[id];
};

// Function to delete a product
export const remove = async (id: string): Promise<null | void> => {
    const product = await findOne(id);

    if (!product) {
        return null;
    }

    // Delete the product
    delete products[id];

    saveProducts();
};